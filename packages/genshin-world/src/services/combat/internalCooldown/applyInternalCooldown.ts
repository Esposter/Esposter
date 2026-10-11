import type { InternalCooldown } from "#src/models/combat/InternalCooldown";
import type { InternalCooldownGroup } from "#src/models/combat/InternalCooldownGroup";

import { takeOne } from "@esposter/shared";

// A hit under an internal cooldown, counted into it in place, and the share its group's sequence holds for it. A hit
// Once the reset interval has passed since the timer started restarts the timer and the count, and takes the first
// Share; any other is the next hit of the sequence
export const applyInternalCooldown = (
  internalCooldown: InternalCooldown,
  { resetIntervalSeconds, sequence }: InternalCooldownGroup,
  seconds: number,
): number => {
  if (seconds - internalCooldown.startSeconds >= resetIntervalSeconds) {
    internalCooldown.startSeconds = seconds;
    internalCooldown.hitIndex = 0;
  } else internalCooldown.hitIndex += 1;
  return takeOne(sequence, Math.min(internalCooldown.hitIndex, sequence.length - 1));
};
