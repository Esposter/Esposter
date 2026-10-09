import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// The game's furnishing-making and Trust tables in the dump, read by their names. The material table is the crafting's, read
// By the same name, and the realm's tables are fetched into the dump from the AnimeGameData repository, never committed
export const FURNITURE_MAKE_TABLE_NAME = "FurnitureMakeExcelConfigData";
export const HOMEWORLD_LEVEL_TABLE_NAME = "HomeworldLevelExcelConfigData";
export const COMFORT_LEVEL_TABLE_NAME = "HomeWorldComfortLevelExcelConfigData";
// The use an item carries to learn the furnishing it names as its first parameter: a diagram, one item for each blueprint
export const UNLOCK_FURNITURE_USE_OP = "ITEM_USE_UNLOCK_FURNITURE_FORMULA";
// Where the realm's slices are written, in the world's generated folder they are imported on demand from
export const HOME_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "home",
);
export const HOME_BLUEPRINTS_PATH: string = join(HOME_GENERATED_DIRECTORY, "blueprints.json");
export const HOME_LEVELS_PATH: string = join(HOME_GENERATED_DIRECTORY, "levels.json");
