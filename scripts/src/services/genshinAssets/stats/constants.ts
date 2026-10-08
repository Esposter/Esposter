import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// Where the stat tables are written, the world package's generated folder its loaders read
export const STATS_GENERATED_DIRECTORY: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "stats",
);
// What a character's quality means in stars: the purple four, and the gold five, the crossover's gold among them
export const QualityTypeRarityMap: Readonly<Record<string, number>> = {
  QUALITY_ORANGE: 5,
  QUALITY_ORANGE_SP: 5,
  QUALITY_PURPLE: 4,
};
// The catalogue region each association the game files a character under names: a nation's own, and the Fatui
// Counted as Snezhnaya's, as the wiki counts them. Every other association, the Traveler's and a visitor's, names none
export const AssociationRegionIdMap: Readonly<Record<string, string>> = {
  ASSOC_TYPE_FATUI: "snezhnaya",
  ASSOC_TYPE_FONTAINE: "fontaine",
  ASSOC_TYPE_INAZUMA: "inazuma",
  ASSOC_TYPE_LIYUE: "liyue",
  ASSOC_TYPE_MONDSTADT: "mondstadt",
  ASSOC_TYPE_NATLAN: "natlan",
  ASSOC_TYPE_NODKRAI: "nod-krai",
  ASSOC_TYPE_SUMERU: "sumeru",
};
// The character table's playable characters, apart from its test and retired rows
export const PLAYABLE_AVATAR_USE_TYPE = "AVATAR_FORMAL";
// The property a table writes in a slot holding nothing
export const EMPTY_PROPERTY_TYPE = "FIGHT_PROP_NONE";
// The item id a slot holding nothing names: an unused cost slot of a phase, and a weapon refined by a copy alone
export const EMPTY_ITEM_ID = 0;
