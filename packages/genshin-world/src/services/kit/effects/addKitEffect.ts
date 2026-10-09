import type { KitEffect } from "#src/models/kit/KitEffect";

// Adds an effect to the field's list, replacing an earlier one of the same kind on the same character, the game restarting
// A buff or an infusion it is given again rather than stacking it
export const addKitEffect = (effects: KitEffect[], effect: KitEffect): void => {
  const index = effects.findIndex((kitEffect) => {
    if (kitEffect.kind !== effect.kind || kitEffect.characterId !== effect.characterId) return false;
    return kitEffect.kind === "buff" && effect.kind === "buff"
      ? kitEffect.attribute === effect.attribute
      : kitEffect.kind === "infusion" && effect.kind === "infusion" && kitEffect.element === effect.element;
  });
  if (index === -1) effects.push(effect);
  else effects[index] = effect;
};
