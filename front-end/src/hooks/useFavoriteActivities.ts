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
import { useCallback } from "react";
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
    (activity: ActivityFragment) => {
      return addMutation({
        variables: { activityId: activity.id },
        optimisticResponse: {
          addFavoriteActivity: [
            ...(user?.favoriteActivities ?? []),
            { __typename: "Activity" as const, ...activity },
          ],
        },
      });
    },
    [addMutation, user?.favoriteActivities],
  );

  const remove = useCallback(
    (activityId: string) => {
      return removeMutation({
        variables: { activityId },
        optimisticResponse: {
          removeFavoriteActivity: (user?.favoriteActivities ?? []).filter(
            (a) => a.id !== activityId,
          ),
        },
      });
    },
    [removeMutation, user?.favoriteActivities],
  );

  const toggle = useCallback(
    (activity: ActivityFragment) => {
      const isFav = (user?.favoriteActivities ?? []).some(
        (f) => f.id === activity.id,
      );
      if (isFav) return remove(activity.id);
      return add(activity);
    },
    [user?.favoriteActivities, add, remove],
  );

  const reorder = useCallback(
    (activityIds: string[]) => {
      const byId = new Map(
        (user?.favoriteActivities ?? []).map((a) => [a.id, a]),
      );
      return reorderMutation({
        variables: { activityIds },
        optimisticResponse: {
          reorderFavoriteActivities: activityIds
            .map((id) => byId.get(id))
            .filter(Boolean) as ActivityFragment[],
        },
      });
    },
    [reorderMutation, user?.favoriteActivities],
  );

  const isFavorite = useCallback(
    (activityId: string) =>
      (user?.favoriteActivities ?? []).some((f) => f.id === activityId),
    [user?.favoriteActivities],
  );

  const getAll = useCallback(
    (): ActivityFragment[] => user?.favoriteActivities ?? [],
    [user?.favoriteActivities],
  );

  return {
    add,
    remove,
    toggle,
    reorder,
    isFavorite,
    getAll,
  };
}
