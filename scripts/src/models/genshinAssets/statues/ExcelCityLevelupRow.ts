import type { ExcelCityLevelupAction } from "#src/models/genshinAssets/statues/ExcelCityLevelupAction";

// One level of a region's statues: the Oculi it takes, a count the dump names by an obfuscated key, and the reward row
// Its actions and reward are read from. Level 1 takes none
export interface ExcelCityLevelupRow {
  actionVec: ExcelCityLevelupAction[];
  cityId: number;
  // Empty on level 1, which takes none: the dump writes an empty object for a default count and item
  consumeItem: { itemId?: number; KMKNLDIOOND?: number };
  level: number;
  rewardID: number;
  sceneId: number;
}
