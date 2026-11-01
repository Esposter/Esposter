import type { KitEffect } from "#src/models/kit/KitEffect";
import type { GroundPoint } from "genshin-engine";

import { checkIsInKitField } from "#src/services/kit/effects/checkIsInKitField";

// The factor the cooldown of a skill or a burst cast at a point is multiplied by: each field standing over the point
// That lowers cooldowns multiplies it, whichever character cast the field
export const getKitFieldCooldownMultiplier = (effects: readonly KitEffect[], point: GroundPoint): number =>
  effects.reduce(
    (multiplier, effect) =>
      effect.kind === "field" && effect.cooldownMultiplier !== undefined && checkIsInKitField(effect, point)
        ? multiplier * effect.cooldownMultiplier
        : multiplier,
    1,
  );
