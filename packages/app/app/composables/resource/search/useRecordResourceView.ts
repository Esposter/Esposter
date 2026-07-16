import type { RecentResourceView } from "@/models/resource/search/RecentResourceView";
import type { Resource } from "@esposter/db-schema";

import { RECENT_RESOURCE_VIEWS_LIMIT } from "@/services/resource/search/constants";
import { pushRecent } from "@/services/resource/search/pushRecent";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";

// Feeds the search dropdown's "Recently viewed" group — per-device by design (localStorage)
export const useRecordResourceView = (resource: Ref<Resource | undefined>) => {
  const recentResourceViews = useLocalStorage<RecentResourceView[]>(LocalStorageKey.ResourceRecentViews, []);

  watchImmediate(resource, (newResource) => {
    if (!newResource) return;
    const { id, name, type } = newResource;
    recentResourceViews.value = pushRecent(
      recentResourceViews.value,
      { id, name, type },
      (a, b) => a.id === b.id,
      RECENT_RESOURCE_VIEWS_LIMIT,
    );
  });
};
