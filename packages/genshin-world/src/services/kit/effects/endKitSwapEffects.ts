import type { KitEffect } from "#src/models/kit/KitEffect";

// Ends each effect of a character leaving the field that its leaving ends, a summon's character being the one that cast
// It: each runs out with the swap's step, so none of them acts in it
export const endKitSwapEffects = (effects: readonly KitEffect[], characterId: number): void => {
  for (const effect of effects)
    if (
      "isEndedOnSwap" in effect &&
      effect.isEndedOnSwap &&
      (effect.kind === "summon" ? effect.combatant.characterId : effect.characterId) === characterId
    )
      effect.secondsRemaining = 0;
};
