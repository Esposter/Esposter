// One rod of the game's rod table: the city it is bought in (zero for every city), its base attack, its attack's
// Multiplier and accuracy, and its maximum attack
export interface ExcelFishRodRow {
  attackAcc: number;
  attackMag: number;
  baseAttack: number;
  cityId: number;
  id: number;
  maxAttack: number;
}
