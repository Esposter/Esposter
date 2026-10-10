import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEventKind } from "#src/models/kit/KitEventKind";

// An effect on the team ran out, by its seconds or by being ended, and was dropped from the team's effects
export interface KitEffectExpiredEvent {
  effect: KitEffect;
  kind: KitEventKind.EffectExpired;
}
