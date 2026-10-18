import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { GAME_TIME_ZONE } from "#src/services/originalResin/constants";
import { computeShopRefreshTime } from "#src/services/shop/computeShopRefreshTime";

// The moment a mined mining outcrop is back: the day's reset after the one at or before the mining, in the game's time
// Zone. A mining outcrop mined before a reset is back at that reset, and one mined at or after it at the next
export const computeMiningOutcropRespawn = (minedAt: Temporal.Instant): Temporal.Instant =>
  computeShopRefreshTime(ShopRefresh.Daily, minedAt).toZonedDateTimeISO(GAME_TIME_ZONE).add({ days: 1 }).toInstant();
