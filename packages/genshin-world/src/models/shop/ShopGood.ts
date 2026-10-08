// One good of a shop as the generated slice holds it: the item it gives and how many, the item it is bought with and how
// Many, its buy limit where zero is no limit, the Adventure Rank it shows from, and the game-time moments it sells
// Between, as ISO strings with the game's offset
export interface ShopGood {
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
