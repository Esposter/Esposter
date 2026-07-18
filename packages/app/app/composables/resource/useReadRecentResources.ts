import type { RecentResource } from "@/models/resource/RecentResource";
import type { RecentResourceView } from "@/models/resource/search/RecentResourceView";

import { DEFAULT_RESOURCE_SORT_BY, RECENT_RESOURCES_LIMIT } from "@/services/resource/constants";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { getResultAsync } from "@esposter/shared";

// Recent means recently *viewed* — what you opened, not what happened to autosave.
// Views are per-device (localStorage); the rows themselves are resolved server-side so a rename
// Or a delete elsewhere is reflected here, and ids that no longer resolve are simply dropped.
export const useReadRecentResources = () => {
  const { $trpc } = useNuxtApp();
  const recentResourceViews = useLocalStorage<RecentResourceView[]>(LocalStorageKey.ResourceRecentViews, []);
  const recentResources = ref<RecentResource[]>([]);
  const error = ref<string>();
  const isLoading = ref(false);
  const readRecentResources = async () => {
    isLoading.value = true;
    // A failed read keeps the card useful: the error (with its Retry) renders instead of a dead skeleton
    await getResultAsync(async () => {
      const views = recentResourceViews.value.slice(0, RECENT_RESOURCES_LIMIT);
      if (views.length === 0) {
        // Nothing viewed on this device yet, so fall back to recently updated — the card is never
        // Empty for someone who has resources but has not opened one since this shipped
        const { items } = await $trpc.resource.readResources.query({
          limit: RECENT_RESOURCES_LIMIT,
          sortBy: [...DEFAULT_RESOURCE_SORT_BY],
        });
        recentResources.value = items;
      } else {
        const { items } = await $trpc.resource.readResources.query({
          ids: views.map(({ id }) => id),
          limit: RECENT_RESOURCES_LIMIT,
        });
        // The server has no opinion on view order, so the localStorage order is what orders the card;
        // A view whose id no longer resolves was deleted and falls out here
        recentResources.value = views.flatMap((view) => {
          const item = items.find(({ id }) => id === view.id);
          return item ? [Object.assign(item, { viewedAt: view.viewedAt })] : [];
        });
      }
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
