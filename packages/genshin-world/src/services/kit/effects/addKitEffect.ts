import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

// Whether an effect restarts an earlier one: a buff, an infusion, a status or a stance of the same kind on the same
// Character, and for a buff the same attribute from the same source, for an infusion the same element, for a status the same id,
// and for an element's CRIT DMG the same character, element and source. An anti-cold is restarted by the next, as the team holds one.
// A field, a bubble and a summon are never restarted, as each one is its own
const checkIsRestartedBy = (earlier: KitEffect, effect: KitEffect): boolean => {
  if (earlier.kind === "buff" && effect.kind === "buff")
    return (
      earlier.characterId === effect.characterId &&
      earlier.attribute === effect.attribute &&
      earlier.source === effect.source
    );
  if (earlier.kind === "infusion" && effect.kind === "infusion")
    return earlier.characterId === effect.characterId && earlier.element === effect.element;
  if (earlier.kind === "status" && effect.kind === "status")
    return earlier.characterId === effect.characterId && earlier.id === effect.id;
  if (earlier.kind === "stance" && effect.kind === "stance") return earlier.characterId === effect.characterId;
  if (earlier.kind === "antiCold" && effect.kind === "antiCold") return true;
  if (earlier.kind === "elementCriticalDamage" && effect.kind === "elementCriticalDamage")
    return (
      earlier.characterId === effect.characterId &&
      earlier.element === effect.element &&
      earlier.source === effect.source
    );
  return false;
};

// Adds an effect to the field's list, the game restarting what it is given again rather than stacking it.
// A shield is recast over the one a character holds, which ends there, so the earlier one is dropped on the next step and
// Its explosion, if it has one, goes off then. A Crystallize shield overwrites the team's one Crystallize shield alone,
// Beside every character's own
export const addKitEffect = (kitEffectState: KitEffectState, effect: KitEffect): void => {
  if (effect.kind === "shield")
    for (const earlier of kitEffectState.effects)
      if (
        earlier.kind === "shield" &&
        Boolean(earlier.isCrystallize) === Boolean(effect.isCrystallize) &&
        (effect.isCrystallize || earlier.characterId === effect.characterId)
      )
        earlier.secondsRemaining = 0;
  const index = kitEffectState.effects.findIndex((earlier) => checkIsRestartedBy(earlier, effect));
  kitEffectState.effects =
    index === -1 ? [...kitEffectState.effects, effect] : kitEffectState.effects.with(index, effect);
};
