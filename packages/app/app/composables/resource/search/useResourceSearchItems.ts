import type { ResourceSearchItem } from "@/models/resource/search/ResourceSearchItem";

import { ResourceSearchGroup } from "@/models/resource/search/ResourceSearchGroup";
import { RECENT_SEARCHES_LIMIT, RESOURCE_SEARCH_LIMIT } from "@/services/resource/search/constants";
import { getPageSearchItems } from "@/services/resource/search/getPageSearchItems";
import { getResourceSearchItem } from "@/services/resource/search/getResourceSearchItem";
import { getServiceSearchItems } from "@/services/resource/search/getServiceSearchItems";
import { pushRecent } from "@/services/resource/search/pushRecent";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import { useRecentStore } from "@/store/resource/recent";
import { ID_SEPARATOR, normalizeString, RoutePath } from "@esposter/shared";

// Flat dropdown contents across groups: as-you-type Resources/Services/Pages for a query, recent searches
// (per-device — a query typed here is not something to follow you) plus recently opened resources (the
// Caller's own server-side access rows, so the dropdown and the Recent route can never disagree) when empty
export const useResourceSearchItems = (searchQuery: Ref<string>) => {
  const { $trpc } = useNuxtApp();
  const recentSearches = useLocalStorage<string[]>(LocalStorageKey.ResourceRecentSearches, []);
  const recentStore = useRecentStore();
  const { recents } = storeToRefs(recentStore);
  // Only the empty query renders them, but the dropdown opens on an empty query — so they are read on mount
  // Rather than on the first keystroke that clears the box. The store reads once per session, so the inline
  // Mount on Home costs nothing beyond what the Recent card already asked for
  onMounted(() => recentStore.readRecents());
  const resourceItems = ref<ResourceSearchItem[]>([]);
  const items = computed<ResourceSearchItem[]>(() =>
    searchQuery.value
      ? [...resourceItems.value, ...getServiceSearchItems(searchQuery.value), ...getPageSearchItems(searchQuery.value)]
      : [
          ...recentSearches.value.map((recentSearch) => ({
            group: ResourceSearchGroup.RecentSearches,
            icon: "mdi-history",
            id: `${ResourceSearchGroup.RecentSearches}${ID_SEPARATOR}${recentSearch}`,
            title: recentSearch,
            to: { path: RoutePath.ResourceExplorerAll, query: { search: recentSearch } },
          })),
          ...recents.value.map((recent) => getResourceSearchItem(recent, ResourceSearchGroup.RecentlyOpened)),
        ],
  );
  const addRecentSearch = (newSearch: string) => {
    const normalizedSearch = normalizeString(newSearch);
    if (!normalizedSearch) return;
    recentSearches.value = pushRecent(recentSearches.value, normalizedSearch, RECENT_SEARCHES_LIMIT);
  };
  const { isPending } = useAutoSearch(searchQuery, {
    reset: () => {
      resourceItems.value = [];
    },
    search: async (sanitizedSearchQuery, signal) => {
      const { items: newItems } = await $trpc.resource.readResources.query(
        { limit: RESOURCE_SEARCH_LIMIT, searchQuery: sanitizedSearchQuery },
        { signal },
      );
      resourceItems.value = newItems.map((newResource) =>
        getResourceSearchItem(newResource, ResourceSearchGroup.Resources),
      );
    },
  });

  return { addRecentSearch, isPending, items };
};
