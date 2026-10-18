import { ShopRefresh } from "#src/models/genshinAssets/shops/ShopRefresh";

// Paimon's Bargains' goods are the goods of shop 1001, the one whose goods restock monthly beside the Fates. Its shop row,
// 102, names the shop and holds none of them
export const PAIMON_BARGAINS_SHOP_TYPE = 1001;
// The general goods the Mondstadt grocery sells, shop 1004 in the table, the one the city's grocery row is read as
export const MONDSTADT_GENERAL_GOODS_SHOP_TYPE = 1004;
// Mondstadt's city in the shop table, whose shops' discount the grocery's goods take
export const MONDSTADT_CITY_ID = 1;
// The Masterless currencies the shop's Fates are bought with, Starglitter and Stardust, by their item ids in the game's
// Tables, and the Fates it gives, Intertwined and Acquaint, by theirs
export const SHOP_CURRENCY_ITEM_IDS: readonly number[] = [221, 222];
export const SHOP_FATE_ITEM_IDS: readonly number[] = [223, 224];
// Mora's item id in the game's tables, the price of a good the table gives in Mora rather than in items
export const MORA_ITEM_ID = 202;
// The refresh type the table gives a monthly good, as its string, which the filter reads
export const MONTHLY_REFRESH_TYPE = "SHOP_REFRESH_MONTHLY";
// The refresh kinds the table names, as the generated slice names them
export const SHOP_REFRESH_BY_TABLE_TYPE: Partial<Record<string, ShopRefresh>> = {
  SHOP_REFRESH_DAILY: ShopRefresh.Daily,
  SHOP_REFRESH_MONTHLY: ShopRefresh.Monthly,
  SHOP_REFRESH_NONE: ShopRefresh.None,
};
// The offset the game's own shop times carry, UTC+8, appended to each one as it is built
export const GAME_TIME_OFFSET = "+08:00";
// Paimon's Bargains' two character rotations, one for each character of a pair, and the five weapon rotations, each of
// Which gives a Royal weapon at its first order and a Blackcliff weapon at its second
export const PAIMON_BARGAINS_CHARACTER_ROTATE_IDS = [10201, 10202] as const;
export const PAIMON_BARGAINS_WEAPON_ROTATE_IDS: readonly number[] = [10203, 10204, 10205, 10206, 10207];
export const PAIMON_BARGAINS_PAIR_COUNT = 6;
export const PAIMON_BARGAINS_ROYAL_ORDER = 1;
export const PAIMON_BARGAINS_BLACKCLIFF_ORDER = 2;
// The item use that gives a character card's avatar, and where the avatar's id sits in its parameters
export const GAIN_AVATAR_ITEM_USE = "ITEM_USE_GAIN_AVATAR";
