import type { KitEffect } from "#src/models/kit/KitEffect";
import type { GroundPoint } from "genshin-engine";

import { checkIsInKitField } from "#src/services/kit/effects/checkIsInKitField";

// The factor the cooldown of a skill or a burst cast where a body stands is multiplied by: each field the body stands in
// That lowers cooldowns multiplies it
export const getKitFieldCooldownMultiplier = (effects: readonly KitEffect[], position: GroundPoint): number =>
  effects.reduce(
    (multiplier, effect) =>
      effect.kind === "field" && effect.cooldownMultiplier !== undefined && checkIsInKitField(effect, position)
        ? multiplier * effect.cooldownMultiplier
        : multiplier,
    1,
  );
