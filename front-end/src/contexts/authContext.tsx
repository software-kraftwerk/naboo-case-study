import {
  GetUserQuery,
  GetUserQueryVariables,
  LogoutMutation,
  LogoutMutationVariables,
  SignInInput,
  SignUpInput,
  SigninMutation,
  SigninMutationVariables,
  SignupMutation,
  SignupMutationVariables,
} from "@/graphql/generated/types";

import Logout from "@/graphql/mutations/auth/logout";
import Signin from "@/graphql/mutations/auth/signin";
import Signup from "@/graphql/mutations/auth/signup";
import GetUser from "@/graphql/queries/auth/getUser";
import { useSnackbar } from "@/hooks";
import { useMutation, useQuery, useApolloClient } from "@apollo/client";
import { useRouter } from "next/router";
import { createContext, useEffect, useState } from "react";

interface AuthContextType {
  user: GetUserQuery["getMe"] | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  handleSignin: (input: SignInInput) => Promise<void>;
  handleSignup: (input: SignUpInput) => Promise<void>;
  handleLogout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  handleSignin: () => Promise.resolve(),
  handleSignup: () => Promise.resolve(),
  handleLogout: () => Promise.resolve(),
});

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const snackbar = useSnackbar();
  const apolloClient = useApolloClient();
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<GetUserQuery["getMe"] | null>(null);
  const router = useRouter();

  const [signin] = useMutation<SigninMutation, SigninMutationVariables>(Signin);
  const [signup] = useMutation<SignupMutation, SignupMutationVariables>(Signup);
  const [logout] = useMutation<LogoutMutation, LogoutMutationVariables>(Logout);

  useQuery<GetUserQuery, GetUserQueryVariables>(GetUser, {
    onCompleted: (data) => {
      setUser(data.getMe);
      setIsLoading(false);
    },
    onError: () => setIsLoading(false),
  });

  const handleSignin = async (input: SignInInput) => {
    try {
      setIsLoading(true);
      await signin({ variables: { signInInput: input } });
      // resetStore re-runs GetUser → queryData updates → useEffect sets user
      await apolloClient.resetStore();
      await router.push("/profil");
    } catch (err) {
      snackbar.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (input: SignUpInput) => {
    try {
      setIsLoading(true);
      await signup({ variables: { signUpInput: input } });
      router.push("/signin");
    } catch (err) {
      snackbar.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      setIsLoading(true);
      await logout();
      await apolloClient.clearStore();
      setUser(null);
      router.push("/");
    } catch (err) {
      snackbar.error("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        handleSignin,
        handleSignup,
        handleLogout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
