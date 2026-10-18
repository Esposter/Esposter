import type { AbyssCarryMember } from "#src/models/spiralAbyss/AbyssCarryMember";
import type { AbyssProgress } from "#src/models/spiralAbyss/AbyssProgress";

// A chamber's clear recorded: the cycle's progress after it, and the reward ids the clear gives for the first time
export interface AbyssClearResult {
  // Each member's health and energy as they stand at the clear, which the next chamber starts from
  carry: AbyssCarryMember[];
  givenRewardIds: number[];
  progress: AbyssProgress;
}
