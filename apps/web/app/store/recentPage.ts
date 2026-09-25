import type { PageLink } from "#shared/models/app/PageLink";
import type { RecentPage } from "@/models/app/RecentPage";

import { RECENT_PAGES_STORED_LIMIT } from "@/services/app/constants";
import { getFrecency } from "@/services/app/getFrecency";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";
import deepEqual from "fast-deep-equal";

// The pages this device visited, ranked by frecency — how often and how lately. Kept on the device, since a recent
// List is a convenience rather than data worth a server round trip, and it exists signed out as well
export const useRecentPageStore = defineStore("recentPage", () => {
  const recentPages = useLocalStorage<RecentPage[]>(LocalStorageKey.RecentPages, []);
  const rankedRecentPages = computed(() => {
    const now = Date.now();
    return recentPages.value.toSorted(
      (firstRecentPage, secondRecentPage) => getFrecency(secondRecentPage, now) - getFrecency(firstRecentPage, now),
    );
  });
  const visitPage = (path: string) => {
    const visitedPage = recentPages.value.find((recentPage) => recentPage.path === path);
    const now = Date.now();
    // The least-ranked pages leave once the list is full, so it stays bounded without forgetting the ones in use
    recentPages.value = [
      {
        lastVisitedAt: now,
        mark: visitedPage?.mark,
        path,
        // Empty until the page's head renders; the dock shows the path until then
        title: visitedPage?.title ?? "",
        visitCount: (visitedPage?.visitCount ?? 0) + 1,
      },
      ...recentPages.value.filter((recentPage) => recentPage.path !== path),
    ]
      .toSorted(
        (firstRecentPage, secondRecentPage) => getFrecency(secondRecentPage, now) - getFrecency(firstRecentPage, now),
      )
      .slice(0, RECENT_PAGES_STORED_LIMIT);
  };
  // A page's title and mark settle after it renders, and again whenever its head changes — a room's name arriving
  // After its messages — so they are written separately from the visit and only when either differs
  const updateRecentPage = ({ mark, path, title }: PageLink) => {
    const index = recentPages.value.findIndex((recentPage) => recentPage.path === path);
    const recentPage = recentPages.value[index];
    if (!recentPage || (recentPage.title === title && deepEqual(recentPage.mark, mark))) return;
    recentPages.value = recentPages.value.with(index, { ...recentPage, mark, title });
  };
  return { rankedRecentPages, updateRecentPage, visitPage };
});
