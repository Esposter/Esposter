import type { KitEffect } from "#src/models/kit/KitEffect";

// Ends each summon that ends on the fall of the character that cast it, so each runs out with the next step and lands
// Nothing in it, as endKitSwapEffects ends the effects a swap ends
export const endKitFallEffects = (effects: readonly KitEffect[], characterId: number): void => {
  for (const effect of effects)
    if (effect.kind === "summon" && effect.isEndedOnFall && effect.combatant.characterId === characterId)
      effect.secondsRemaining = 0;
};
