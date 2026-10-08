import type { ExcelProperty } from "#src/models/genshinAssets/stats/ExcelProperty";

// One ascension phase of a weapon's, the phase left out where it is the first. Entering it costs its Mora and items
// And needs the Adventure Rank its player level names
export interface ExcelWeaponPromoteRow {
  addProps: ExcelProperty[];
  coinCost: number;
  costItems: { count: number; id: number }[];
  promoteLevel?: number;
  requiredPlayerLevel: number;
  unlockMaxLevel: number;
  weaponPromoteId: number;
}
