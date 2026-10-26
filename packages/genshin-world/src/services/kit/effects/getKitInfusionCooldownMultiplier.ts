import type { KitEffect } from "#src/models/kit/KitEffect";

// The factor the cooldown of a skill or a burst its character casts is multiplied by: each infusion the character holds
// That lowers cooldowns multiplies it
export const getKitInfusionCooldownMultiplier = (effects: readonly KitEffect[], characterId: number): number =>
  effects.reduce(
    (multiplier, effect) =>
      effect.kind === "infusion" && effect.characterId === characterId && effect.cooldownMultiplier !== undefined
        ? multiplier * effect.cooldownMultiplier
        : multiplier,
    1,
  );
