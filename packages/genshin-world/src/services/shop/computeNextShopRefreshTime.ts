import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { computeNextDailyReset } from "#src/services/time/computeNextDailyReset";
import { computeNextMonthlyReset } from "#src/services/time/computeNextMonthlyReset";
import { computeNextWeeklyReset } from "#src/services/time/computeNextWeeklyReset";

// The refresh after the one at or before `now`, which a good's countdown runs to. Undefined for a good that never refreshes
export const computeNextShopRefreshTime = (
  refresh: ShopRefresh,
  now: Temporal.Instant,
): Temporal.Instant | undefined => {
  if (refresh === ShopRefresh.None) return undefined;
  if (refresh === ShopRefresh.Monthly) return computeNextMonthlyReset(now);
  if (refresh === ShopRefresh.Weekly) return computeNextWeeklyReset(now);
  return computeNextDailyReset(now);
};
