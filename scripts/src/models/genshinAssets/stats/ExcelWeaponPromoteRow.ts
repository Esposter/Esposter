import type { ExcelProperty } from "#src/models/genshinAssets/stats/ExcelProperty";

// One ascension phase of a weapon's, the phase left out where it is the first
export interface ExcelWeaponPromoteRow {
  addProps: ExcelProperty[];
  promoteLevel?: number;
  unlockMaxLevel: number;
  weaponPromoteId: number;
}
