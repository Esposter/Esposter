import type { ShopRefresh } from "#src/models/genshinAssets/shops/ShopRefresh";

// The price, limit and refresh a Paimon's Bargains set is sold at, as its goods give them
export interface PaimonsBargainsPrice {
  buyLimit: number;
  costs: { count: number; itemId: number }[];
  refresh: ShopRefresh;
}
