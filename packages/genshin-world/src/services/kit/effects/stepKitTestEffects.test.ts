import type { KitContext } from "#src/models/kit/KitContext";
import type { KitStrike } from "#src/models/kit/KitStrike";

import { stepKitEffects } from "#src/services/kit/effects/stepKitEffects";
import { describe } from "vitest";

// The team's effects run on by a step, as a suite reads them: the strikes the step lands, copied off the context's list,
// Which the next step empties
export const stepKitTestEffects = (stepSeconds: number, context: KitContext): KitStrike[] => {
  stepKitEffects(stepSeconds, context);
  return [...context.strikes];
};

describe.todo("stepKitTestEffects");
