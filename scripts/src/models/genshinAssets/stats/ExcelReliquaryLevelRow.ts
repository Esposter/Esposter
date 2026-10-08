import type { ExcelProperty } from "#src/models/genshinAssets/stats/ExcelProperty";

// What every main affix gives on an artifact of a rarity at a level, the first level being +0, and the EXP the level costs
export interface ExcelReliquaryLevelRow {
  addProps: ExcelProperty[];
  exp: number;
  level: number;
  rank?: number;
}
