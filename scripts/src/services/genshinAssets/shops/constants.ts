import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// Paimon's Bargains' goods are the goods of shop 1001, the one whose goods restock monthly beside the Fates. Its shop row,
// 102, names the shop and holds none of them
export const PAIMON_BARGAINS_SHOP_TYPE = 1001;
// The Masterless currencies the shop's Fates are bought with, Starglitter and Stardust, by their item ids in the game's
// Tables, and the Fates it gives, Intertwined and Acquaint, by theirs
export const SHOP_CURRENCY_ITEM_IDS: readonly number[] = [221, 222];
export const SHOP_FATE_ITEM_IDS: readonly number[] = [223, 224];
// The refresh type the table gives a monthly good, as its string, which the filter reads
export const MONTHLY_REFRESH_TYPE = "SHOP_REFRESH_MONTHLY";
// The offset the game's own shop times carry, UTC+8, appended to each one as it is written
export const GAME_TIME_OFFSET = "+08:00";
// Where Paimon's Bargains' goods are written, the world's generated folder they are imported on demand from
export const SHOP_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "shops",
);
export const PAIMON_BARGAINS_GOODS_PATH: string = join(SHOP_GENERATED_DIRECTORY, "paimonsBargains.json");
