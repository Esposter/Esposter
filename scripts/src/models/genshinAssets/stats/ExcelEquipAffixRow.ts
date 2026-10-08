import type { ExcelProperty } from "#src/models/genshinAssets/stats/ExcelProperty";

// One bonus of a set's affix, by its place among the set's piece counts, the first left out
export interface ExcelEquipAffixRow {
  addProps: ExcelProperty[];
  id: number;
  level?: number;
}
