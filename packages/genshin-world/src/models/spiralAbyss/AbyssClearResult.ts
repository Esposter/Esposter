import type { AbyssProgress } from "#src/models/spiralAbyss/AbyssProgress";

// A chamber's clear recorded: the cycle's progress after it, and the reward ids the clear gives for the first time
export interface AbyssClearResult {
  givenRewardIds: number[];
  progress: AbyssProgress;
}
