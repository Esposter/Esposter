import type { RecentResourceView } from "@/models/resource/search/RecentResourceView";
import type { ResourceSearchItem } from "@/models/resource/search/ResourceSearchItem";

import { ResourceSearchGroup } from "@/models/resource/search/ResourceSearchGroup";
import {
  RECENT_SEARCHES_LIMIT,
  RESOURCE_SEARCH_DEBOUNCE_MS,
  RESOURCE_SEARCH_LIMIT,
} from "@/services/resource/search/constants";
import { getPageSearchItems } from "@/services/resource/search/getPageSearchItems";
import { getResourceSearchItem } from "@/services/resource/search/getResourceSearchItem";
import { getServiceSearchItems } from "@/services/resource/search/getServiceSearchItems";
import { pushRecent } from "@/services/resource/search/pushRecent";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useAlertStore } from "@/store/alert";
import { getResultAsync, normalizeString, RoutePath } from "@esposter/shared";

// Flat dropdown contents across groups: as-you-type Resources/Services/Pages for a query,
// Recent searches + recently viewed (both per-device localStorage) for the empty query
export const useResourceSearchItems = (searchQuery: Ref<string>) => {
  const { $trpc } = useNuxtApp();
  const alertStore = useAlertStore();
  const { createAlert } = alertStore;
  const recentSearches = useLocalStorage<string[]>(LocalStorageKey.ResourceRecentSearches, []);
  const recentResourceViews = useLocalStorage<RecentResourceView[]>(LocalStorageKey.ResourceRecentViews, []);
  const resourceItems = ref<ResourceSearchItem[]>([]);
  const isPending = ref(false);
  const debouncedSearchQuery = refDebounced(searchQuery, RESOURCE_SEARCH_DEBOUNCE_MS);
  const items = computed<ResourceSearchItem[]>(() =>
    searchQuery.value
      ? [...resourceItems.value, ...getServiceSearchItems(searchQuery.value), ...getPageSearchItems(searchQuery.value)]
      : [
          ...recentSearches.value.map((recentSearch) => ({
            group: ResourceSearchGroup.RecentSearches,
            icon: "mdi-history",
            id: `${ResourceSearchGroup.RecentSearches}-${recentSearch}`,
            title: recentSearch,
            to: { path: RoutePath.ResourcesAll, query: { search: recentSearch } },
          })),
          ...recentResourceViews.value.map((recentResourceView) =>
            getResourceSearchItem(recentResourceView, ResourceSearchGroup.RecentlyViewed),
          ),
        ],
  );
  const addRecentSearch = (newSearch: string) => {
    const normalizedSearch = normalizeString(newSearch);
    if (!normalizedSearch) return;
    recentSearches.value = pushRecent(recentSearches.value, normalizedSearch, (a, b) => a === b, RECENT_SEARCHES_LIMIT);
  };

  watch(debouncedSearchQuery, async (newSearchQuery) => {
    if (!newSearchQuery) {
      resourceItems.value = [];
      return;
    }

    isPending.value = true;
    const result = await getResultAsync(() =>
      $trpc.resource.readResources.query({ limit: RESOURCE_SEARCH_LIMIT, searchQuery: newSearchQuery }),
    );
    // A newer keystroke owns the pending state and will deliver fresher results
    if (newSearchQuery !== debouncedSearchQuery.value) return;
    isPending.value = false;
    result.match(
      ({ items: newItems }) => {
        resourceItems.value = newItems.map((newResource) =>
          getResourceSearchItem(newResource, ResourceSearchGroup.Resources),
        );
      },
      (error) => {
        createAlert(error.message, "error");
      },
    );
  });

  return { addRecentSearch, isPending, items };
};
