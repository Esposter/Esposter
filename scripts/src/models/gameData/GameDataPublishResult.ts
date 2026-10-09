import type { GameDataTarget } from "#src/models/gameData/GameDataTarget";
import type { GameDataLock } from "genshin-world";

// The lock a publish would commit, and what it did to get there: nothing when the lock already names it, or the number
// Of objects each account received when it was published. A dry run reports only the objects it would store
export interface GameDataPublishResult {
  isUnchanged: boolean;
  nextLock: GameDataLock;
  storedObjectCount: number;
  uploadedCountMap?: Record<GameDataTarget, number>;
}
