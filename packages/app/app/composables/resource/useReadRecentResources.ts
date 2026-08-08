import type { ResourceListItem } from "#shared/models/resource/ResourceListItem";

import { LAST_ACCESSED_RESOURCE_SORT_BY, RECENT_RESOURCES_LIMIT } from "@/services/resource/constants";
import { getResultAsync } from "@esposter/shared";

// Recent means recently *opened* — what you went to, not what happened to autosave. The set is the caller's
// Own access rows, so it follows them between devices and the Home card and the Recent list route are the
// Same read at two limits.
export const useReadRecentResources = () => {
  const { $trpc } = useNuxtApp();
  const recentResources = ref<ResourceListItem[]>([]);
  const error = ref<string>();
  const isLoading = ref(false);
  const readRecentResources = async () => {
    isLoading.value = true;
    // A failed read keeps the card useful: the error (with its Retry) renders instead of a dead skeleton
    await getResultAsync(async () => {
      const { items } = await $trpc.resource.readResources.query({
        isAccessed: true,
        limit: RECENT_RESOURCES_LIMIT,
        sortBy: [...LAST_ACCESSED_RESOURCE_SORT_BY],
      });
      recentResources.value = items;
    }).match(
      () => {
        error.value = undefined;
      },
      (newError) => {
        error.value = newError.message;
      },
    );
    isLoading.value = false;
  };
  return { error, isLoading, readRecentResources, recentResources };
};
