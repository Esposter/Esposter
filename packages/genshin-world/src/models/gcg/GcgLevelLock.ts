// One of the card game's level locks as the game's table gives it: the Player Level it holds at, and the main quest that
// Passes it. The Player Level may not rise past the lock's level until that quest is done
export interface GcgLevelLock {
  unlockLevel: number;
  unlockMainQuestId: string;
}
