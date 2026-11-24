// One character's Friendship card in the dump's FetterCharacterCard table: the character, the Friendship Level its
// Reward opens at, and the reward the level pays
export interface ExcelFetterCharacterCardRow {
  avatarId: number;
  fetterLevel: number;
  rewardId: number;
}
