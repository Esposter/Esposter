import type { KitEffect } from "#src/models/kit/KitEffect";

// Whether an effect restarts an earlier one: a buff or an infusion of the same kind on the same character, and for a
// Buff the same attribute, or for an infusion the same element, or a shield on the same character. A field is never
// Restarted, as each one is its own
const checkIsRestartedBy = (earlier: KitEffect, effect: KitEffect): boolean => {
  if (earlier.kind === "buff" && effect.kind === "buff")
    return earlier.characterId === effect.characterId && earlier.attribute === effect.attribute;
  if (earlier.kind === "infusion" && effect.kind === "infusion")
    return earlier.characterId === effect.characterId && earlier.element === effect.element;
  // A shield is recast over the one a character holds, as the game replaces it
  if (earlier.kind === "shield" && effect.kind === "shield") return earlier.characterId === effect.characterId;
  return false;
};

// Adds an effect to the field's list, the game restarting a buff or an infusion it is given again rather than stacking it
export const addKitEffect = (effects: KitEffect[], effect: KitEffect): void => {
  const index = effects.findIndex((earlier) => checkIsRestartedBy(earlier, effect));
  if (index === -1) effects.push(effect);
  else effects[index] = effect;
};
