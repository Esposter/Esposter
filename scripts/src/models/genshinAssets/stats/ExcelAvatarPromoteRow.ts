import type { ExcelProperty } from "#src/models/genshinAssets/stats/ExcelProperty";

// One ascension phase of a character's, the first of them at level zero. Entering it costs its Mora and items
// And needs the Adventure Rank its player level names
export interface ExcelAvatarPromoteRow {
  addProps: ExcelProperty[];
  avatarPromoteId: number;
  costItems: { count: number; id: number }[];
  promoteLevel: number;
  requiredPlayerLevel: number;
  scoinCost: number;
  unlockMaxLevel: number;
}
