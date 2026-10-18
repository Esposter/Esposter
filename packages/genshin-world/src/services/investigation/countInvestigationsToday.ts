import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { computeShopRefreshTime } from "#src/services/shop/computeShopRefreshTime";

// How many investigations were made in the game day at `now`, counted from the daily reset: one at the reset counts
// Toward the new day, and one made before it does not
export const countInvestigationsToday = (
  investigatedAts: readonly Temporal.Instant[],
  now: Temporal.Instant,
): number => {
  const dailyReset = computeShopRefreshTime(ShopRefresh.Daily, now);
  return investigatedAts.filter((investigatedAt) => Temporal.Instant.compare(investigatedAt, dailyReset) >= 0).length;
};
