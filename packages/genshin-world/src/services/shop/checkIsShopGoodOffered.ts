import type { ShopGood } from "#src/models/shop/ShopGood";

// Whether a good is offered at `now` to a player of this Adventure Rank: at or past its rank, and within its sale dates
export const checkIsShopGoodOffered = (good: ShopGood, adventureRank: number, now: Temporal.Instant): boolean =>
  adventureRank >= good.minPlayerLevel &&
  Temporal.Instant.compare(Temporal.Instant.from(good.beginTime), now) <= 0 &&
  Temporal.Instant.compare(now, Temporal.Instant.from(good.endTime)) < 0;
