import type { KitEffect } from "#src/models/kit/KitEffect";

// Whether a character carries a buff of a source that has not run out, as gcsim's StatModIsActive reads a stat mod's
// Expiry, which a passive gating one effect on another's buff reads
export const checkIsKitBuffActive = (effects: readonly KitEffect[], characterId: number, source: string): boolean =>
  effects.some(
    (effect) =>
      effect.kind === "buff" &&
      effect.characterId === characterId &&
      effect.source === source &&
      effect.secondsRemaining > 0,
  );
