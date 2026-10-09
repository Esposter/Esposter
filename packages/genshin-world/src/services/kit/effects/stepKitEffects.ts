import type { KitEffect } from "#src/models/kit/KitEffect";

// Runs each effect's seconds down by a step, and drops those that have run out, written into the list in place
export const stepKitEffects = (effects: KitEffect[], stepSeconds: number): void => {
  for (const effect of effects) effect.secondsRemaining -= stepSeconds;
  const remainingEffects = effects.filter(({ secondsRemaining }) => secondsRemaining > 0);
  effects.splice(0, effects.length, ...remainingEffects);
};
