import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

// Whether an effect restarts an earlier one: a buff or an infusion of the same kind on the same character, and for a
// Buff the same attribute, or for an infusion the same element. A field, a bubble and a summon are never restarted, as
// Each one is its own
const checkIsRestartedBy = (earlier: KitEffect, effect: KitEffect): boolean => {
  if (earlier.kind === "buff" && effect.kind === "buff")
    return earlier.characterId === effect.characterId && earlier.attribute === effect.attribute;
  if (earlier.kind === "infusion" && effect.kind === "infusion")
    return earlier.characterId === effect.characterId && earlier.element === effect.element;
  return false;
};

// Adds an effect to the field's list, the game restarting a buff or an infusion it is given again rather than stacking it.
// A shield is recast over the one a character holds, which ends there, so the earlier one is dropped on the next step and
// Its explosion, if it has one, goes off then
export const addKitEffect = (kitEffectState: KitEffectState, effect: KitEffect): void => {
  if (effect.kind === "shield")
    for (const earlier of kitEffectState.effects)
      if (earlier.kind === "shield" && earlier.characterId === effect.characterId) earlier.secondsRemaining = 0;
  const index = kitEffectState.effects.findIndex((earlier) => checkIsRestartedBy(earlier, effect));
  kitEffectState.effects =
    index === -1 ? [...kitEffectState.effects, effect] : kitEffectState.effects.with(index, effect);
};
