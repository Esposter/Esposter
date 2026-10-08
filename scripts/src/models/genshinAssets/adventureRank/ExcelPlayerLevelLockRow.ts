// One World Level of the game's level lock table: the rank it raises the cap to, the rank and the main quest that
// Unlock it (0 for none)
export interface ExcelPlayerLevelLockRow {
  playerLevelUpperLimit: number;
  unlockMainQuestId: number;
  unlockPlayerLevel: number;
  worldLevel: number;
}
