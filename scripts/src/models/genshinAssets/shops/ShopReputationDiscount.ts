// A Reputation discount on a slice's shops: the level it starts at and the shop types it names
// It applies at those shops, and at no other
export interface ShopReputationDiscount {
  level: number;
  shopTypes: readonly number[];
}
