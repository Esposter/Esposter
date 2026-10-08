import { REPOSITORY_ROOT } from "#src/services/shared/constants";
import { join } from "node:path";

// The nation whose places are written: Mondstadt's, the first region's, the rest joining as their statues are placed
export const MONDSTADT_CITY_ID = 1;
// The scene whose points a place's statue is named by, the overworld's, which every statue condition names
export const EXPEDITION_SCENE_ID = 3;
// The three condition kinds a place opens by, as the table spells them
export const EXPEDITION_RANK_CONDITION = "EXP_OPEN_COND_LEVEL";
export const EXPEDITION_POINT_CONDITION = "EXP_OPEN_COND_POINT";
export const EXPEDITION_QUEST_CONDITION = "EXP_OPEN_COND_QUEST";
// Where Mondstadt's places are written, the world's generated folder they are imported on demand from
export const MONDSTADT_EXPEDITIONS_PATH: string = join(
  REPOSITORY_ROOT,
  "packages",
  "genshin-world",
  "src",
  "generated",
  "expeditions",
  "mondstadt.json",
);
// The expedition limit's rows, relative to the world's data folder, which the world reads as its data
export const EXPEDITION_LIMITS_RELATIVE_PATH = "expeditions/limits.json";
