// One good bought, by its id and the moment it was bought, from which its buy limit's count is read against the refresh
export interface ShopPurchase {
  goodsId: number;
  purchasedAt: Temporal.Instant;
}
