import type { ForgeQueueState } from "genshin-interface";

// One forge queue as the forge state holds it: its number, the Adventure Rank that opens it, the recipe of the order it holds
// (none while it is idle or locked), the units of that order forged so far, the seconds left on it and its state
export interface ForgeQueueSlot {
  forged: number;
  id: number;
  recipeId?: number;
  remainingSeconds: number;
  state: ForgeQueueState;
  unlockRank: number;
}
