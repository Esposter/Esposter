import type { GameDataPublishOutcome } from "#src/models/gameData/GameDataPublishOutcome";
import type { GameDataRecord } from "#src/models/gameData/GameDataRecord";
import type { GameDataTarget } from "#src/models/gameData/GameDataTarget";
import type { GameDataLock } from "genshin-world";

// Each outcome carries only what it has: a dry run carries the lock it would leave and the records it would store, for the
// Caller to compare against what is published, and a published one the lock the caller commits and each account's count
export type GameDataPublishResult =
  | {
      nextLock: GameDataLock;
      outcome: GameDataPublishOutcome.DryRun;
      records: GameDataRecord[];
      storedObjectCount: number;
    }
  | {
      outcome: GameDataPublishOutcome.Published;
      plannedLock: GameDataLock;
      storedObjectCount: number;
      uploadedCountMap: Record<GameDataTarget, number>;
    }
  | { outcome: GameDataPublishOutcome.Unchanged };
