import { WIKI_CACHE_DIRECTORY } from "#src/services/genshinAssets/kits/constants";
import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// The distance, in game units, within which two enemy marks of one kind join one camp. Provisional: the map gives no
// Camp membership, and a hand-placed camp's three fighters lie within five units of one another, so ten leaves room for
// A wider camp. No measure checks it, so it stays provisional until a camp's extent is read from the game
export const CAMP_CLUSTER_DISTANCE = 10;

// The enemy level band the wiki's Adventure Rank table gives at World Level 0, from its lowest level to its highest,
// Shared by every region's camps. Provisional: the table gives one band for the whole world, not one per region
const CAMP_LEVEL_BAND = { max: 36, min: 1 };

// The level every enemy of a camp is given: the middle of the band, as an estimate until a camp's own level is read
export const CAMP_LEVEL: number = Math.floor((CAMP_LEVEL_BAND.min + CAMP_LEVEL_BAND.max) / 2);

// The enemy pages the Enemy page names, each read for the variants it lists: its eight families and groups, and the
// Normal Bosses it names as a type, the two bosses no family page lists. Their members are the camp labels
export const ENEMY_FAMILY_PAGE_TITLES: readonly string[] = [
  "Automatons",
  "The Abyss",
  "Elemental Lifeforms",
  "Mystical Beasts",
  "Hilichurls",
  "Fatui",
  "Other Human Factions",
  "Enemies of Note",
  "Normal Boss",
];

// The singulars a family label's variants name it by where dropping a word's final s does not give them
export const IRREGULAR_FAMILY_LABEL_SINGULARS: ReadonlyMap<string, string> = new Map([["Fungi", "Fungus"]]);

// The generated family-label map the camps read, which the family-labels command writes from the family pages
export const FAMILY_LABEL_MAP_RELATIVE_PATH = "scripts/src/services/genshinAssets/camps/FamilyLabelEnemyKindIdMap.ts";
export const FAMILY_LABEL_MAP_PATH: string = join(REPOSITORY_ROOT, FAMILY_LABEL_MAP_RELATIVE_PATH);

// The wiki's redirects from the family labels, cached as one file in the wiki cache, and the titles each batch asks the
// Wiki for at once
export const FAMILY_LABEL_REDIRECTS_PATH: string = join(WIKI_CACHE_DIRECTORY, "Redirects_Family_Labels.json");
export const FAMILY_LABEL_REDIRECT_BATCH_SIZE = 50;
