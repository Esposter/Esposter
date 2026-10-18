// One row of the game's weapon table, of the fields its attributes, name, EXP and refinement need, a destroy rule and
// An attribute left out where it is the first of its enum
export interface ExcelWeaponRow {
  awakenCosts: number[];
  awakenMaterial: number;
  destroyReturnMaterial: number[];
  destroyReturnMaterialCount: number[];
  destroyRule?: string;
  id: number;
  nameTextMapHash: number;
  rankLevel: number;
  skillAffix: number[];
  weaponBaseExp: number;
  weaponPromoteId: number;
  weaponProp: { initValue: number; propType?: string; type: string }[];
  weaponType: string;
}
