import type { RestorativePower } from "#src/models/statue/RestorativePower";

import {
  RESTORATIVE_POWER_PER_STATUE,
  RESTORATIVE_POWER_REFILL_SECONDS,
  RESTORATIVE_POWER_REFILL_SHARE,
} from "#src/services/statue/constants";

// The pool regenerated to `now` for the statues unlocked: a refill of its maximum's share each refill while it is below
// The maximum. The moment it last changed moves on by the refills that came, so the time to the next keeps its place;
// At the maximum refilling stops and the moment is `now`, so a spend from there starts the next refill at that moment
export const regenerateRestorativePower = (
  power: RestorativePower,
  unlockedStatueCount: number,
  now: Temporal.Instant,
): RestorativePower => {
  const maximum = unlockedStatueCount * RESTORATIVE_POWER_PER_STATUE;
  if (power.amount >= maximum) return { amount: power.amount, changedAt: now };
  const refillAmount = maximum * RESTORATIVE_POWER_REFILL_SHARE;
  const elapsedSeconds = power.changedAt.until(now, { largestUnit: "seconds" }).seconds;
  const refills = Math.min(
    Math.max(0, Math.floor(elapsedSeconds / RESTORATIVE_POWER_REFILL_SECONDS)),
    Math.ceil((maximum - power.amount) / refillAmount),
  );
  const amount = Math.min(maximum, power.amount + refills * refillAmount);
  return {
    amount,
    changedAt: amount >= maximum ? now : power.changedAt.add({ seconds: refills * RESTORATIVE_POWER_REFILL_SECONDS }),
  };
};
