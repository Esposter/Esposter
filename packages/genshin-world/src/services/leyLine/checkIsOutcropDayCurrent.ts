import { ShopRefresh } from "#src/models/shop/ShopRefresh";
import { computeShopRefreshTime } from "#src/services/shop/computeShopRefreshTime";

// Whether a draw made at `drawnAt` still stands at `now`: no daily reset has come between the two. The outcrops are drawn
// At the game's daily reset, the one the shops refresh at
export const checkIsOutcropDayCurrent = (drawnAt: Temporal.Instant, now: Temporal.Instant): boolean =>
  Temporal.Instant.compare(computeShopRefreshTime(ShopRefresh.Daily, now), drawnAt) <= 0;
