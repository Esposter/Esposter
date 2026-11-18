import type { WorldEffect } from "#src/models/effects/WorldEffect";

// Runs each world effect's life down by the seconds given, and drops in place those whose life has run out, so the list
// Holds only the effects still showing
export const stepWorldEffects = (effects: WorldEffect[], seconds: number): void => {
  let remainingCount = 0;
  for (const effect of effects) {
    effect.secondsRemaining -= seconds;
    if (effect.secondsRemaining > 0) effects[remainingCount++] = effect;
  }
  effects.length = remainingCount;
};
