import { FISH_STOCK_REFILL_DURATION } from "#src/services/fishing/constants";

// Whether a point emptied at `emptiedAt` holds its stock again at `now`: its fish come back once the refill duration has
// Passed, so the day's and the night's stocks each keep their own moment
export const checkIsFishingStockRefilled = (emptiedAt: Temporal.Instant, now: Temporal.Instant): boolean =>
  Temporal.Instant.compare(now, emptiedAt.add(FISH_STOCK_REFILL_DURATION)) >= 0;
