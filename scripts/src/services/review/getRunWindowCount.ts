import { REVIEW_RUN_WINDOW_CAP } from "#src/services/review/constants";

// The windows one run reviews, from whether `main` may move to each owed window's end: the cap's earliest, stretched
// Through The first window `main` may move to. A passed window `main` cannot reach is forgotten with its run, so a run
// Stopping short Of one would leave the next run to review the same windows again, and `main` would never move.
export const getRunWindowCount = (advanceables: boolean[]): number =>
  Math.max(REVIEW_RUN_WINDOW_CAP, advanceables.indexOf(true) + 1);
