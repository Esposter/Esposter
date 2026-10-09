import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitShield } from "#src/models/kit/KitShield";

// Whether an effect is a shield with seconds left: one a strike on the character on the field is taken by, until its
// Health is spent, which ends it
export const checkIsKitShieldLive = (effect: KitEffect): effect is KitShield =>
  effect.kind === "shield" && effect.secondsRemaining > 0;
