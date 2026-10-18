import type { SheerCold } from "#src/models/sheerCold/SheerCold";
import type { SheerColdStep } from "#src/models/sheerCold/SheerColdStep";

import {
  SHEER_COLD_DAMAGE_INTERVAL_SECONDS,
  SHEER_COLD_DAMAGE_SHARE,
  SHEER_COLD_GAIN_PER_SECOND,
  SHEER_COLD_HEAT_DRAIN_PER_SECOND,
  SHEER_COLD_MAXIMUM,
  SHEER_COLD_SWIM_GAIN_MULTIPLIER,
} from "#src/services/sheerCold/constants";

// One step of the gauge over its seconds. Heat near the character drains the gauge wherever it stands; otherwise the
// Subzero climate fills it, faster while swimming, and where neither holds the gauge stands. Full at the step's end, it
// Deals its share of damage for each interval it has stayed full, the time short of the next carried over, and anything
// Else clears that time
export const stepSheerCold = (
  sheerCold: SheerCold,
  { isHeated, isInCold, isSwimming }: SheerColdStep,
  stepSeconds: number,
): { damage: number; sheerCold: SheerCold } => {
  let rate = 0;
  if (isHeated) rate = -SHEER_COLD_HEAT_DRAIN_PER_SECOND;
  else if (isInCold) rate = SHEER_COLD_GAIN_PER_SECOND * (isSwimming ? SHEER_COLD_SWIM_GAIN_MULTIPLIER : 1);
  const value = Math.min(SHEER_COLD_MAXIMUM, Math.max(0, sheerCold.value + rate * stepSeconds));
  if (value < SHEER_COLD_MAXIMUM) return { damage: 0, sheerCold: { damageSeconds: 0, value } };
  const seconds = sheerCold.damageSeconds + stepSeconds;
  const intervals = Math.floor(seconds / SHEER_COLD_DAMAGE_INTERVAL_SECONDS);
  return {
    damage: intervals * SHEER_COLD_DAMAGE_SHARE,
    sheerCold: { damageSeconds: seconds - intervals * SHEER_COLD_DAMAGE_INTERVAL_SECONDS, value },
  };
};
