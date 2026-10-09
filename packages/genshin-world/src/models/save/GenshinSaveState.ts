import type { Wallet } from "#src/models/inventory/Wallet";
import type { QuestProgress } from "#src/models/quest/QuestProgress";

// The systems a save holds as the world reads them: the wallet, each carried quest's progress by its id and the ids of
// The landmarks resonated with, which the save's slices convert to and from
export interface GenshinSaveState {
  quests: ReadonlyMap<string, QuestProgress>;
  unlockedLandmarkIds: ReadonlySet<string>;
  wallet: Wallet;
}
