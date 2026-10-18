// One level lock of the card game's table, as the dump names its plain fields: the Player Level it holds at, and the main
// Quest that passes it
export interface ExcelGcgLevelLockRow {
  levelId: number;
  unlockLevel: number;
  unlockMainQuestId: number;
}
