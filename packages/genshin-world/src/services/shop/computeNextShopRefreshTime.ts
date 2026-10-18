import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { GAME_TIME_ZONE } from "#src/services/originalResin/constants";
import { computeShopRefreshTime } from "#src/services/shop/computeShopRefreshTime";

// The refresh after the one at or before `now`, which a good's countdown runs to. Undefined for a good that never refreshes
export const computeNextShopRefreshTime = (
  refresh: ShopRefresh,
  now: Temporal.Instant,
): Temporal.Instant | undefined => {
  if (refresh === ShopRefresh.None) return undefined;
  const refreshTime = computeShopRefreshTime(refresh, now).toZonedDateTimeISO(GAME_TIME_ZONE);
  const nextRefreshTime =
    refresh === ShopRefresh.Monthly
      ? refreshTime.add({ months: 1 })
      : refreshTime.add({ days: refresh === ShopRefresh.Weekly ? 7 : 1 });
  return nextRefreshTime.toInstant();
};
