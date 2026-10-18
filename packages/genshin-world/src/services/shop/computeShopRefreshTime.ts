import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { GAME_DAY_START_HOUR, GAME_TIME_ZONE } from "#src/services/originalResin/constants";
import {
  DAYS_IN_WEEK,
  MONTHLY_REFRESH_DAY_OF_MONTH,
  SHOP_NEVER_REFRESHED_AT,
  WEEKLY_REFRESH_DAY_OF_WEEK,
} from "#src/services/shop/constants";

// The day a refresh of a kind falls on at or before `gameDay`: the day itself, the first of its month, or its week's Monday
const getRefreshDay = (refresh: ShopRefresh, gameDay: Temporal.PlainDate): Temporal.PlainDate => {
  if (refresh === ShopRefresh.Monthly) return gameDay.with({ day: MONTHLY_REFRESH_DAY_OF_MONTH });
  if (refresh === ShopRefresh.Weekly)
    return gameDay.subtract({ days: (gameDay.dayOfWeek - WEEKLY_REFRESH_DAY_OF_WEEK + DAYS_IN_WEEK) % DAYS_IN_WEEK });
  return gameDay;
};

// The refresh of a kind at or before `now`: the game day's start, or the first of the month's or the week's Monday at the
// Game's daily hour, read in the game's time zone. The game day is counted from that hour, so a moment before the hour
// Still belongs to the day, week or month before. A good that never refreshes has its purchases counted from the epoch
export const computeShopRefreshTime = (refresh: ShopRefresh, now: Temporal.Instant): Temporal.Instant => {
  if (refresh === ShopRefresh.None) return SHOP_NEVER_REFRESHED_AT;
  const gameDay = now.toZonedDateTimeISO(GAME_TIME_ZONE).subtract({ hours: GAME_DAY_START_HOUR }).toPlainDate();
  const refreshDay = getRefreshDay(refresh, gameDay);
  return refreshDay
    .toZonedDateTime({ plainTime: Temporal.PlainTime.from({ hour: GAME_DAY_START_HOUR }), timeZone: GAME_TIME_ZONE })
    .toInstant();
};
