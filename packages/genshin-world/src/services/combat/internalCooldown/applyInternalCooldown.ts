import type { InternalCooldown } from "#src/models/combat/InternalCooldown";
import type { InternalCooldownGroup } from "#src/models/combat/InternalCooldownGroup";

import { takeOne } from "@esposter/shared";

// A hit under an internal cooldown, counted into it in place, and the share of its gauge it applies. A hit once the
// Reset interval has passed since the timer started restarts the timer and the count, and applies; any other is the
// Next hit of the sequence, applying what the sequence holds for it
export const applyInternalCooldown = (
  internalCooldown: InternalCooldown,
  { gaugeSequence, resetIntervalSeconds }: InternalCooldownGroup,
  seconds: number,
): number => {
  if (seconds - internalCooldown.startSeconds >= resetIntervalSeconds) {
    internalCooldown.startSeconds = seconds;
    internalCooldown.hitIndex = 0;
  } else internalCooldown.hitIndex += 1;
  return takeOne(gaugeSequence, Math.min(internalCooldown.hitIndex, gaugeSequence.length - 1));
};
