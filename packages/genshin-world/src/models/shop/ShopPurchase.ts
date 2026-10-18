// What a good's purchases count against its buy limit: how many were bought in the refresh window the latest was bought
// In, and the moment of that latest, from which the window is read. A good is listed once, and only while it has a limit
export interface ShopPurchase {
  count: number;
  goodsId: number;
  lastPurchasedAt: Temporal.Instant;
}
