import type { AbyssChamberProgress } from "#src/models/spiralAbyss/AbyssChamberProgress";

// One cycle of the Abyss's progress: the record of each chamber cleared or tried in it, by the chamber's id, and the
// Rewards it has given. The Corridor is one cycle that never resets; each period of the Moon Spire is one of its own
export interface AbyssProgress {
  chamberIdProgressMap: Map<number, AbyssChamberProgress>;
  claimedRewardIds: Set<number>;
}
