import type { ExcelGcgCostEntry } from "#src/models/genshinAssets/gcg/ExcelGcgSkillRow";

// One card of the card game's card table, as the dump names its fields: its type, its tags, its cost and the skills it
// Carries by id, which the skill table names
export interface ExcelGcgCardRow {
  cardType: string;
  costList: ExcelGcgCostEntry[];
  id: number;
  skillList: number[];
  tagList: string[];
}
