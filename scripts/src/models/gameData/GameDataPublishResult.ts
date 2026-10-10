import type { GameDataPublishOutcome } from "#src/models/gameData/GameDataPublishOutcome";
import type { GameDataTarget } from "#src/models/gameData/GameDataTarget";
import type { GameDataLock } from "genshin-world";

// Each outcome carries only what it has: a published one carries the lock the caller commits and each account's count
export type GameDataPublishResult =
  | { outcome: GameDataPublishOutcome.DryRun; storedObjectCount: number }
  | {
      outcome: GameDataPublishOutcome.Published;
      plannedLock: GameDataLock;
      storedObjectCount: number;
      uploadedCountMap: Record<GameDataTarget, number>;
    }
  | { outcome: GameDataPublishOutcome.Unchanged };
