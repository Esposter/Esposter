import { ShopRefresh } from "#src/models/genshinAssets/shops/ShopRefresh";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// Paimon's Bargains' goods are the goods of shop 1001, the one whose goods restock monthly beside the Fates. Its shop row,
// 102, names the shop and holds none of them
export const PAIMON_BARGAINS_SHOP_TYPE = 1001;
// The general goods the Mondstadt grocery sells, shop 1004 in the table, the one the city's grocery row is read as
export const MONDSTADT_GENERAL_GOODS_SHOP_TYPE = 1004;
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
// The offset the game's own shop times carry, UTC+8, appended to each one as it is written
export const GAME_TIME_OFFSET = "+08:00";
// The world's generated folder the shop slices are written to and imported on demand from
export const SHOP_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "shops",
);
export const PAIMON_BARGAINS_GOODS_PATH: string = join(SHOP_GENERATED_DIRECTORY, "paimonsBargains.json");
export const MONDSTADT_GENERAL_GOODS_PATH: string = join(SHOP_GENERATED_DIRECTORY, "mondstadtGeneralGoods.json");
