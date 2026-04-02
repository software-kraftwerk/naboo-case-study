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
import { useCallback, useEffect, useState } from "react";
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

  // Local state for instant optimistic UI feedback before cache propagates.
  const [favoriteIds, setFavoriteIds] = useState<string[]>(
    () => user?.favoriteActivities?.map((f) => f.id) ?? [],
  );

  // Sync local state when the Apollo cache updates (after mutation update callback).
  const serverKey = user?.favoriteActivities?.map((f) => f.id).join(",") ?? "";
  useEffect(() => {
    setFavoriteIds(user?.favoriteActivities?.map((f) => f.id) ?? []);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [serverKey]);

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
    (activityId: string) => {
      setFavoriteIds((prev) => [...prev, activityId]);
      return addMutation({ variables: { activityId } });
    },
    [addMutation],
  );

  const remove = useCallback(
    (activityId: string) => {
      setFavoriteIds((prev) => prev.filter((id) => id !== activityId));
      return removeMutation({ variables: { activityId } });
    },
    [removeMutation],
  );

  const toggle = useCallback(
    (activityId: string) => {
      if (favoriteIds.includes(activityId)) return remove(activityId);
      return add(activityId);
    },
    [favoriteIds, add, remove],
  );

  const reorder = useCallback(
    (activityIds: string[]) => {
      setFavoriteIds(activityIds);
      return reorderMutation({ variables: { activityIds } });
    },
    [reorderMutation],
  );

  const isFavorite = useCallback(
    (activityId: string) => favoriteIds.includes(activityId),
    [favoriteIds],
  );

  const getAll = useCallback((): ActivityFragment[] => {
    const byId = new Map(
      (user?.favoriteActivities ?? []).map((a) => [a.id, a]),
    );
    return favoriteIds
      .map((id) => byId.get(id))
      .filter(Boolean) as ActivityFragment[];
  }, [favoriteIds, user?.favoriteActivities]);

  return {
    add,
    remove,
    toggle,
    reorder,
    isFavorite,
    getAll,
  };
}
