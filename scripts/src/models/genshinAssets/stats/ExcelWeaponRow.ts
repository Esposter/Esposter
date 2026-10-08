// One row of the game's weapon table, of the fields its attributes and its name need
export interface ExcelWeaponRow {
  id: number;
  nameTextMapHash: number;
  rankLevel: number;
  weaponPromoteId: number;
  weaponProp: { initValue?: number; propType: string; type: string }[];
  weaponType: string;
}
