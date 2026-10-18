import { ShopRefresh } from "#src/models/genshinAssets/shops/ShopRefresh";

// Paimon's Bargains' goods are the goods of shop 1001, the one whose goods restock monthly beside the Fates. Its shop row,
// 102, names the shop and holds none of them
export const PAIMON_BARGAINS_SHOP_TYPE = 1001;
// The general goods the Mondstadt grocery sells, shop 1004 in the table, the one the city's grocery row is read as
export const MONDSTADT_GENERAL_GOODS_SHOP_TYPE = 1004;
// Mondstadt's city in the shop table, whose shops' discount the grocery's goods take
export const MONDSTADT_CITY_ID = 1;
// The Realm Depot's goods, filed under shop type 1048 in the goods rows, each under the sub tab the depot shows it in
export const REALM_DEPOT_SHOP_TYPE = 1048;
export const REALM_DEPOT_TABS: readonly { stem: string; subTabId: number }[] = [
  { stem: "realmDepotTreasures", subTabId: 1 },
  { stem: "realmDepotFurnishings", subTabId: 2 },
  { stem: "realmDepotBlueprints", subTabId: 3 },
  { stem: "realmDepotRiches", subTabId: 4 },
  { stem: "realmDepotCreatures", subTabId: 5 },
  { stem: "realmDepotWood", subTabId: 6 },
];
// The Masterless currencies the shop's Fates are bought with, Starglitter and Stardust, by their item ids in the game's
// Tables, and the Fates it gives, Intertwined and Acquaint, by theirs
export const SHOP_CURRENCY_ITEM_IDS: readonly number[] = [221, 222];
export const SHOP_FATE_ITEM_IDS: readonly number[] = [223, 224];
// Mora's item id in the game's tables, the price of a good the table gives in Mora rather than in items
export const MORA_ITEM_ID = 202;
// The refresh type the table gives a monthly good, as its string, which the filter reads
export const MONTHLY_REFRESH_TYPE = "SHOP_REFRESH_MONTHLY";
// The refresh a good the table leaves no refresh for is read as: the table's zero, which the dump leaves out of the row
export const SHOP_REFRESH_NONE_TABLE_TYPE = "SHOP_REFRESH_NONE";
// The refresh kinds the table names, as the generated slice names them
export const SHOP_REFRESH_BY_TABLE_TYPE: Partial<Record<string, ShopRefresh>> = {
  SHOP_REFRESH_DAILY: ShopRefresh.Daily,
  SHOP_REFRESH_MONTHLY: ShopRefresh.Monthly,
  SHOP_REFRESH_NONE: ShopRefresh.None,
  SHOP_REFRESH_WEEKLY: ShopRefresh.Weekly,
};
// The offset the game's own shop times carry, UTC+8, appended to each one as it is built
export const GAME_TIME_OFFSET = "+08:00";
