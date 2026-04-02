import {
  ActivityFragment,
  AddFavoriteActivityMutation,
  AddFavoriteActivityMutationVariables,
  GetUserQuery,
  RemoveFavoriteActivityMutation,
  RemoveFavoriteActivityMutationVariables,
  ReorderFavoriteActivitiesMutation,
  ReorderFavoriteActivitiesMutationVariables,
} from "@/graphql/generated/types";
import AddFavoriteActivity from "@/graphql/mutations/favorite/addFavoriteActivity";
import RemoveFavoriteActivity from "@/graphql/mutations/favorite/removeFavoriteActivity";
import ReorderFavoriteActivities from "@/graphql/mutations/favorite/reorderFavoriteActivities";
import GetUser from "@/graphql/queries/auth/getUser";
import { ApolloCache, useMutation } from "@apollo/client";
import { useCallback, useMemo } from "react";
import { useAuth } from "./useAuth";

// Updates the favoriteActivities field of GetUser directly in cache — no network refetch.
function updateCacheFavorites(
  cache: ApolloCache<object>,
  newFavorites: ActivityFragment[],
) {
  cache.updateQuery<GetUserQuery>({ query: GetUser }, (data) => {
    if (!data?.getMe) return data;
    return {
      getMe: {
        ...data.getMe,
        favoriteActivities: newFavorites,
      },
    };
  });
}

export function useFavoriteActivities() {
  const { user } = useAuth();

  const [addMutation] = useMutation<
    AddFavoriteActivityMutation,
    AddFavoriteActivityMutationVariables
  >(AddFavoriteActivity, {
    update(cache, { data }) {
      if (data) updateCacheFavorites(cache, data.addFavoriteActivity);
    },
  });

  const [removeMutation] = useMutation<
    RemoveFavoriteActivityMutation,
    RemoveFavoriteActivityMutationVariables
  >(RemoveFavoriteActivity, {
    update(cache, { data }) {
      if (data) updateCacheFavorites(cache, data.removeFavoriteActivity);
    },
  });

  const [reorderMutation] = useMutation<
    ReorderFavoriteActivitiesMutation,
    ReorderFavoriteActivitiesMutationVariables
  >(ReorderFavoriteActivities, {
    update(cache, { data }) {
      if (data) updateCacheFavorites(cache, data.reorderFavoriteActivities);
    },
  });

  const add = useCallback(
    (activityId: string) => addMutation({ variables: { activityId } }),
    [addMutation],
  );

  const remove = useCallback(
    (activityId: string) => removeMutation({ variables: { activityId } }),
    [removeMutation],
  );

  const toggle = useCallback(
    (activityId: string) => {
      const isFav = (user?.favoriteActivities ?? []).some(
        (f) => f.id === activityId,
      );
      return isFav ? remove(activityId) : add(activityId);
    },
    [user?.favoriteActivities, add, remove],
  );

  const reorder = useCallback(
    (activityIds: string[]) => reorderMutation({ variables: { activityIds } }),
    [reorderMutation],
  );

  const isFavorite = useCallback(
    (activityId: string) =>
      (user?.favoriteActivities ?? []).some((f) => f.id === activityId),
    [user?.favoriteActivities],
  );

  const favorites = useMemo(
    () => user?.favoriteActivities ?? [],
    [user?.favoriteActivities],
  );

  return {
    add,
    remove,
    toggle,
    reorder,
    isFavorite,
    favorites,
  };
}
