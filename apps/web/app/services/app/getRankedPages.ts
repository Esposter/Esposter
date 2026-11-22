import type { RecentPage } from "#src/models/app/RecentPage";

import { getFrecency } from "#src/services/app/getFrecency";

// The one ranking both the dock's order and the trim of a full list read, so the pages kept are the ones shown first
export const getRankedPages = (recentPages: RecentPage[], now: number) =>
  recentPages.toSorted(
    (firstRecentPage, secondRecentPage) => getFrecency(secondRecentPage, now) - getFrecency(firstRecentPage, now),
  );
