import type { RecentPage } from "@/models/app/RecentPage";

import { RECENT_PAGES_STORED_LIMIT } from "@/services/app/constants";
import { getFrecency } from "@/services/app/getFrecency";
import { LocalStorageKey } from "@/services/shared/LocalStorageKey";

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
  // A page's title settles after it renders, and again whenever its head changes — a room's name arriving after
  // Its messages — so the title is written separately from the visit and only when it differs
  const setPageTitle = (path: string, title: string) => {
    const index = recentPages.value.findIndex((recentPage) => recentPage.path === path);
    const recentPage = recentPages.value[index];
    if (!recentPage || recentPage.title === title) return;
    recentPages.value = recentPages.value.with(index, { ...recentPage, title });
  };
  return { rankedRecentPages, setPageTitle, visitPage };
});
