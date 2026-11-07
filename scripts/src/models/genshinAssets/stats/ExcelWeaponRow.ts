// One row of the game's weapon table, of the fields its attributes, name, description, icon, EXP and refinement need, a
// Destroy rule and an attribute left out where it is the first of its enum
export interface ExcelWeaponRow {
  awakenCosts: number[];
  awakenMaterial: number;
  descTextMapHash?: number;
  destroyReturnMaterial: number[];
  destroyReturnMaterialCount: number[];
  destroyRule?: string;
  icon: string;
  id: number;
  nameTextMapHash: number;
  rankLevel: number;
  skillAffix: number[];
  weaponBaseExp: number;
  weaponPromoteId: number;
  weaponProp: { initValue: number; propType?: string; type: string }[];
  weaponType: string;
}
