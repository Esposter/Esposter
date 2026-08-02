import type { RecentResourceView } from "@/models/resource/search/RecentResourceView";
import type { Resource } from "@esposter/db-schema";

import { RECENT_RESOURCE_VIEWS_LIMIT } from "@/services/resource/search/constants";
import { pushRecent } from "@/services/resource/search/pushRecent";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";

// Feeds Home's Recent tab and the search dropdown's "Recently viewed" group.
// Per-device by design (localStorage): a recent that differs per device is tolerable, unlike a favorite.
export const useRecordResourceView = (resource: Ref<Resource | undefined>) => {
  const recentResourceViews = useLocalStorage<RecentResourceView[]>(LocalStorageKey.ResourceRecentViews, []);

  // Watches the identity, not the object: every autosave, rename and tag edit replaces the ref with a new
  // Object, and re-recording on those would order Recent by last autosave rather than last open — this
  // Records what you opened, not what happened to it while it was open
  watchImmediate(
    () => resource.value?.id,
    () => {
      const newResource = resource.value;
      if (!newResource) return;

      const { id, name, type } = newResource;
      recentResourceViews.value = pushRecent(
        recentResourceViews.value,
        { id, name, type, viewedAt: new Date().toISOString() },
        (a, b) => a.id === b.id,
        RECENT_RESOURCE_VIEWS_LIMIT,
      );
    },
  );
};
