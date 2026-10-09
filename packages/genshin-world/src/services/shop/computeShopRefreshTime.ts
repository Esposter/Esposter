import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { GAME_DAY_START_HOUR, GAME_TIME_ZONE } from "#src/services/originalResin/constants";
import { MONTHLY_REFRESH_DAY_OF_MONTH, SHOP_NEVER_REFRESHED_AT } from "#src/services/shop/constants";

// The refresh of a kind at or before `now`: the game day's start, or the first of the month's at the game's daily hour,
// Read in the game's time zone. The game day is counted from that hour, so a moment before the hour still belongs to the
// Day or month before. A good that never refreshes has its purchases counted from the epoch
export const computeShopRefreshTime = (refresh: ShopRefresh, now: Temporal.Instant): Temporal.Instant => {
  if (refresh === ShopRefresh.None) return SHOP_NEVER_REFRESHED_AT;
  const gameDay = now.toZonedDateTimeISO(GAME_TIME_ZONE).subtract({ hours: GAME_DAY_START_HOUR }).toPlainDate();
  const refreshDay = refresh === ShopRefresh.Monthly ? gameDay.with({ day: MONTHLY_REFRESH_DAY_OF_MONTH }) : gameDay;
  return refreshDay
    .toZonedDateTime({ plainTime: Temporal.PlainTime.from({ hour: GAME_DAY_START_HOUR }), timeZone: GAME_TIME_ZONE })
    .toInstant();
};
