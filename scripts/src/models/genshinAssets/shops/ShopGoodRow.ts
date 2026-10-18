import type { ShopRefresh } from "#src/models/genshinAssets/shops/ShopRefresh";

// One good as the world reads it: the item it gives and how many, the items it is bought with and how many of each, its buy
// Limit (zero for none), when that limit comes back, the Adventure Rank it shows from, and the game-time moments it sells
// Between, as ISO strings with the game's offset
export interface ShopGoodRow {
  beginTime: string;
  buyLimit: number;
  costs: { count: number; itemId: number }[];
  endTime: string;
  goodsId: number;
  itemCount: number;
  itemId: number;
  minPlayerLevel: number;
  refresh: ShopRefresh;
  // The sub tab a good is shown on, where its shop has tabs: the Realm Depot's six, each named by the table's sub tab id
  tabId?: number;
  reputationDiscountLevel?: number;
}
