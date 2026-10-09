// One good of the game's shop table: the shop it belongs to, the item it gives and how many, what it costs in each kind of
// Currency (an item slot names its id and count, an unused slot is zero), its buy limit, its refresh, the Adventure Rank
// It shows from, its rotation's id, and the game-time dates it sells between
export interface ExcelShopGoodsRow {
  beginTime: string;
  buyLimit: number;
  costHcoin: number;
  costItems: { count?: number; id?: number }[];
  costMcoin: number;
  costScoin: number;
  endTime: string;
  goodsId: number;
  itemCount: number;
  itemId: number;
  minPlayerLevel: number;
  refreshType: string;
  rotateId: number;
  shopType: number;
}
