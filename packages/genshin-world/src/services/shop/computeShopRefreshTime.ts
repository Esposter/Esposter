import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { SHOP_NEVER_REFRESHED_AT } from "#src/services/shop/constants";
import { computeLastDailyReset } from "#src/services/time/computeLastDailyReset";
import { computeLastMonthlyReset } from "#src/services/time/computeLastMonthlyReset";
import { computeLastWeeklyReset } from "#src/services/time/computeLastWeeklyReset";

// The refresh of a kind at or before `now`, on the server's clock. A good that never refreshes has its purchases counted
// From the epoch
export const computeShopRefreshTime = (refresh: ShopRefresh, now: Temporal.Instant): Temporal.Instant => {
  if (refresh === ShopRefresh.None) return SHOP_NEVER_REFRESHED_AT;
  if (refresh === ShopRefresh.Monthly) return computeLastMonthlyReset(now);
  if (refresh === ShopRefresh.Weekly) return computeLastWeeklyReset(now);
  return computeLastDailyReset(now);
};
