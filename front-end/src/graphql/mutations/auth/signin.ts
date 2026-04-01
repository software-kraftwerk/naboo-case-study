import gql from "graphql-tag";

const Signin = gql`
  mutation Signin($signInInput: SignInInput!) {
    login(signInInput: $signInInput)
  }
`;

export default Signin;
