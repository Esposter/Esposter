import type { Combatant } from "#src/models/kit/Combatant";
import type { KitContext } from "#src/models/kit/KitContext";
import type { PassiveModule } from "#src/models/kit/PassiveModule";

import { KitEventKind } from "#src/models/kit/KitEventKind";
import { FIXED_STEP_SECONDS } from "#src/services/constants";
import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { describe } from "vitest";

// The given seconds stepped as the world steps a passive's kit: each step's effects, then the expiries they send to the
// Passive, then the passive's own clock, so a passive that counts its effects' expiry hears it on the step it ran out
export const stepPassiveSeconds = (
  context: KitContext,
  passiveModule: PassiveModule,
  combatant: Combatant,
  seconds: number,
): void => {
  for (let stepIndex = 0; stepIndex < Math.round(seconds / FIXED_STEP_SECONDS); stepIndex++) {
    stepKitEffects(FIXED_STEP_SECONDS, context);
    for (const effect of context.expiredEffects)
      passiveModule.onKitEvent?.({ effect, kind: KitEventKind.EffectExpired }, context, combatant);
    passiveModule.onStep?.(context, combatant, FIXED_STEP_SECONDS);
  }
};

describe.todo("stepPassiveSeconds");
