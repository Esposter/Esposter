import { ShopRefresh } from "#src/models/genshinAssets/shops/ShopRefresh";

// Paimon's Bargains' goods are the goods of shop 1001, the one whose goods restock monthly beside the Fates. Its shop row,
// 102, names the shop and holds none of them
export const PAIMON_BARGAINS_SHOP_TYPE = 1001;
// The general goods the Mondstadt grocery sells, shop 1004 in the table, the one the city's grocery row is read as
export const MONDSTADT_GENERAL_GOODS_SHOP_TYPE = 1004;
// The Good Hunter's food shop, which Sara runs: the restaurant's food, cooking ingredients and recipes, shop 1005 in the table
export const GOOD_HUNTER_SHOP_TYPE = 1005;
// The Fishing Associations' shops, one in each region, by the shop's number in the goods table and the stem of the dataset
// Its goods are published under. Each member's stock is matched to its shop by the names of its goods, from the wiki's page
export const FISHING_ASSOCIATION_SHOPS: readonly { shopType: number; stem: string }[] = [
  { shopType: 1064, stem: "mondstadtFishing" },
  { shopType: 1065, stem: "liyueFishing" },
  { shopType: 1066, stem: "inazumaFishing" },
  { shopType: 1071, stem: "sumeruFishing" },
  { shopType: 1090, stem: "fontaineFishing" },
  { shopType: 1122, stem: "natlanFishing" },
  { shopType: 1137, stem: "nodKraiFishing" },
  { shopType: 1156, stem: "snezhnayaFishing" },
];
// The seven Mondstadt vendors' shops, by the shop's number in the goods table and the stem of the dataset each vendor's goods
// Are published under. Each vendor's stock is matched to its shop by the names of its goods, read from the wiki's vendor pages
export const MONDSTADT_VENDOR_SHOPS: readonly { shopType: number; stem: string }[] = [
  { shopType: 1011, stem: "mondstadtFlora" },
  { shopType: 1012, stem: "mondstadtCharles" },
  { shopType: 1013, stem: "mondstadtShiliu" },
  { shopType: 1014, stem: "mondstadtSchulz" },
  { shopType: 1015, stem: "mondstadtBrook" },
  { shopType: 1017, stem: "mondstadtDraff" },
  { shopType: 1018, stem: "mondstadtChloris" },
];
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
  [SHOP_REFRESH_NONE_TABLE_TYPE]: ShopRefresh.None,
  SHOP_REFRESH_WEEKLY: ShopRefresh.Weekly,
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
// The Sigils a region's Souvenir Shop is paid in, by their item ids in the game's tables: Anemo for Mondstadt and Geo for
// Liyue. A Souvenir good is one priced in one of them, which is how the builder finds the shops, whose table numbers the
// Dump's names do not match
// Each region's Sigil, which its Souvenir Shop takes: the eight Elemental Sigils, named by the region whose Souvenir Shop
// Each one's shop is. Pyro, Hydro, Electro and Dendro are the four the wiki's Elemental Sigils page places in Natlan,
// Fontaine, Inazuma and Sumeru; Luna's Nod-Krai follows the element, which no page here names
export const SOUVENIR_SIGIL_ITEM_IDS = {
  fontaine: 302,
  inazuma: 304,
  liyue: 307,
  mondstadt: 305,
  natlan: 301,
  nodKrai: 308,
  snezhnaya: 306,
  sumeru: 303,
} as const;
// The Card Shop, shop 217 in the shop table: its goods are filed under shop type 2000 and numbered from 217000, and every one
// Is priced in Lucky Coins, the card game's currency, which the bag holds as a material
export const GCG_CARD_SHOP_TYPE = 2000;
export const GCG_CARD_SHOP_ID = 217;
export const GCG_LUCKY_COIN_ITEM_ID = 107_021;
