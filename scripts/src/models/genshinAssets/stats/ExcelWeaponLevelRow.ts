// One level of the game's weapon levelling table: the EXP a weapon of each rarity needs to rise past it, from one star
export interface ExcelWeaponLevelRow {
  level: number;
  requiredExps: number[];
}
