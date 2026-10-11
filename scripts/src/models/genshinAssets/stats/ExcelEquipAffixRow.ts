import type { ExcelProperty } from "#src/models/genshinAssets/stats/ExcelProperty";

// One bonus of a set's affix, by its place among the set's piece counts, the first left out: the attributes it adds,
// And the numbers its effect reads, padded with zeros to the table's width
export interface ExcelEquipAffixRow {
  addProps: ExcelProperty[];
  id: number;
  level?: number;
  paramList: number[];
}
