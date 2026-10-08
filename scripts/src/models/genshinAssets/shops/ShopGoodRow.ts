// One good as the world reads it: the item it gives and how many, the item it is bought with and how many, its buy limit
// (zero for none), the Adventure Rank it shows from, and the game-time moments it sells between, as ISO strings with
// The game's offset
export interface ShopGoodRow {
  beginTime: string;
  buyLimit: number;
  endTime: string;
  goodsId: number;
  itemCount: number;
  itemId: number;
  minPlayerLevel: number;
  priceCount: number;
  priceItemId: number;
}
