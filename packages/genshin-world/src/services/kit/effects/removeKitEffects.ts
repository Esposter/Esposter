import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEffectState } from "#src/models/kit/KitEffectState";

// Drops every effect on the team a check picks at once, writing a new list so a walk over the old one runs on as it
// Stood. A dropped effect never runs out, so the step sends no EffectExpired for it, and a summon among them lands nothing
// More
export const removeKitEffects = (
  kitEffectState: KitEffectState,
  checkIsRemoved: (effect: KitEffect) => boolean,
): void => {
  kitEffectState.effects = kitEffectState.effects.filter((effect) => !checkIsRemoved(effect));
};
