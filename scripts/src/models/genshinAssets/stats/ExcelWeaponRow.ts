// One row of the game's weapon table, of the fields its attributes, name, EXP and refinement need
export interface ExcelWeaponRow {
  awakenCosts: number[];
  awakenMaterial: number;
  id: number;
  nameTextMapHash: number;
  rankLevel: number;
  weaponBaseExp: number;
  weaponPromoteId: number;
  weaponProp: { initValue?: number; propType: string; type: string }[];
  weaponType: string;
}
