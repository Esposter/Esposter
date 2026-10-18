import type { KitEffect } from "#src/models/kit/KitEffect";
import type { KitEventKind } from "#src/models/kit/KitEventKind";

// An effect on the team ran out, by its seconds, by being ended or by a blessing's points running out, and was dropped
// From the team's effects
export interface KitEffectExpiredEvent {
  effect: KitEffect;
  kind: KitEventKind.EffectExpired;
}
