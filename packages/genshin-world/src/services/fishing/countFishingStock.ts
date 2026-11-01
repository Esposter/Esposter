import { checkIsFishingCatchReturned } from "#src/services/fishing/checkIsFishingCatchReturned";

// The fish a stock holds at `now`: its full count less each fish caught from it that is not yet back. Each caught fish
// Comes back on its own, so a stock refills fish by fish, its count read off its catches' instants rather than a timer
export const countFishingStock = (
  maxNum: number,
  caughtAts: readonly Temporal.Instant[],
  now: Temporal.Instant,
): number => maxNum - caughtAts.filter((caughtAt) => !checkIsFishingCatchReturned(caughtAt, now)).length;
