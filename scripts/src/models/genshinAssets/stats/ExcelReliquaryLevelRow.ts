import type { ExcelProperty } from "#src/models/genshinAssets/stats/ExcelProperty";

// What every main affix gives on an artifact of a rarity at a level, the first level being +0
export interface ExcelReliquaryLevelRow {
  addProps: ExcelProperty[];
  level: number;
  rank?: number;
}
