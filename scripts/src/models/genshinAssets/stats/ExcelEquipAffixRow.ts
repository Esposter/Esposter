import type { ExcelProperty } from "#src/models/genshinAssets/stats/ExcelProperty";

// One row of an affix group, by its place among the group's levels: the attributes it adds, the numbers its effect
// Reads padded with zeros to the table's width, and the text that names it and describes it at that level
export interface ExcelEquipAffixRow {
  addProps: ExcelProperty[];
  descTextMapHash: number;
  id: number;
  level: number;
  nameTextMapHash: number;
  paramList: number[];
}
