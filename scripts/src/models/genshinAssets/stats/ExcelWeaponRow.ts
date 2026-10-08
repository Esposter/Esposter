// One row of the game's weapon table, of the fields its attributes need
export interface ExcelWeaponRow {
  id: number;
  rankLevel: number;
  weaponPromoteId: number;
  weaponProp: { initValue?: number; propType: string; type: string }[];
  weaponType: string;
}
