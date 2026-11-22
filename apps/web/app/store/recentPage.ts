import type { PageLink } from "#shared/models/app/PageLink";
import type { RecentPage } from "#src/models/app/RecentPage";

import { RECENT_PAGES_CLOCK_INTERVAL_MS, RECENT_PAGES_STORED_LIMIT } from "#src/services/app/constants";
import { getRankedPages } from "#src/services/app/getRankedPages";
import { LocalStorageKey } from "#src/services/shared/LocalStorageKey";
import { checkIsDeepEqual } from "@esposter/shared";

// The pages this device visited, ranked by frecency — how often and how lately. Kept on the device, since a recent
// List is a convenience rather than data worth a server round trip, and it exists signed out as well
export const useRecentPageStore = defineStore("recentPage", () => {
  const recentPages = useLocalStorage<RecentPage[]>(LocalStorageKey.RecentPages, []);
  // A visit is the list's only write, so without a clock the order would hold as it was at the last visit while
  // Frecency ages; this clock re-ranks the pages as time passes
  const clock = useNow({ scheduler: (callback) => useIntervalFn(callback, RECENT_PAGES_CLOCK_INTERVAL_MS) });
  const displayRecentPages = computed(() => getRankedPages(recentPages.value, clock.value.getTime()));
  const visitPage = (path: string) => {
    const visitedPage = recentPages.value.find((recentPage) => recentPage.path === path);
    const now = Date.now();
    // The least-ranked pages leave once the list is full, so it stays bounded without forgetting the ones in use
    recentPages.value = getRankedPages(
      [
        {
          lastVisitedAt: now,
          mark: visitedPage?.mark,
          path,
          // Empty until the page's head renders; the dock shows the path until then
          title: visitedPage?.title ?? "",
          visitCount: (visitedPage?.visitCount ?? 0) + 1,
        },
        ...recentPages.value.filter((recentPage) => recentPage.path !== path),
      ],
      now,
    ).slice(0, RECENT_PAGES_STORED_LIMIT);
  };
  // A page's title and mark settle after it renders, and again whenever its head changes — a room's name arriving
  // After its messages — so they are written separately from the visit and only when either differs
  const updateRecentPage = ({ mark, path, title }: PageLink) => {
    const index = recentPages.value.findIndex((recentPage) => recentPage.path === path);
    const recentPage = recentPages.value[index];
    if (!recentPage || (recentPage.title === title && checkIsDeepEqual(recentPage.mark, mark))) return;
    recentPages.value = recentPages.value.with(index, { ...recentPage, mark, title });
  };
  // A page renamed or removed since its visit has no route left to open, so it leaves the list rather than link nowhere
  const forgetUnmatchedPages = (checkIsPathMatched: (path: string) => boolean) => {
    const matchedPages = recentPages.value.filter(({ path }) => checkIsPathMatched(path));
    if (matchedPages.length === recentPages.value.length) return;
    recentPages.value = matchedPages;
  };
  return { displayRecentPages, forgetUnmatchedPages, updateRecentPage, visitPage };
});
