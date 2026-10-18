// The game's furnishing-making and Trust tables in the dump, read by their names. The material table is the crafting's, read
// By the same name, and the realm's tables are fetched into the dump from the AnimeGameData repository, never committed
export const FURNITURE_MAKE_TABLE_NAME = "FurnitureMakeExcelConfigData";
export const HOMEWORLD_LEVEL_TABLE_NAME = "HomeworldLevelExcelConfigData";
export const COMFORT_LEVEL_TABLE_NAME = "HomeWorldComfortLevelExcelConfigData";
// The use an item carries to learn the furnishing it names as its first parameter: a diagram, one item for each blueprint
export const UNLOCK_FURNITURE_USE_OP = "ITEM_USE_UNLOCK_FURNITURE_FORMULA";
// The garden's field and plant tables: the fields a garden lays out, and the seeds each field's plant grows
export const FARM_FIELD_TABLE_NAME = "HomeWorldFarmFieldExcelConfigData";
export const PLANT_TABLE_NAME = "HomeWorldPlantExcelConfigData";
// The home event table: a reward event gives a companion a furnishing suite it favours, its one-time reward and the talk it
// Speaks, and a summon event the same talk as the companion's invitation. Only the reward events are published
export const HOME_EVENT_TABLE_NAME = "HomeWorldEventExcelConfigData";
export const HOME_AVATAR_REWARD_EVENT_TYPE = "HOME_AVATAR_REWARD_EVENT";
export const HOME_AVATAR_SUMMON_EVENT_TYPE = "HOME_AVATAR_SUMMON_EVENT";
// The realm's area table, which holds the load each area holds at most, and the furnishing table, which holds the load each
// Furnishing takes up in its area
export const AREA_COMFORT_TABLE_NAME = "HomeWorldAreaComfortExcelConfigData";
export const FURNITURE_TABLE_NAME = "HomeWorldFurnitureExcelConfigData";
