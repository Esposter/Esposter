import type { SheerCold } from "#src/models/sheerCold/SheerCold";
import type { SheerColdStep } from "#src/models/sheerCold/SheerColdStep";

import {
  SHEER_COLD_DAMAGE_FLAT,
  SHEER_COLD_DAMAGE_INTERVAL_SECONDS,
  SHEER_COLD_DAMAGE_SHARE,
  SHEER_COLD_GAIN_PER_SECOND,
  SHEER_COLD_HEAT_DRAIN_PER_SECOND,
  SHEER_COLD_LEAVE_DRAIN_PER_SECOND,
  SHEER_COLD_MAXIMUM,
  SHEER_COLD_SWIM_MODIFIER,
} from "#src/services/sheerCold/constants";

// One step of the gauge over its seconds. Heat near the character drains it wherever it stands; otherwise the subzero
// Climate fills it, faster while swimming and less under an anti-cold, which stops it at none, and outside the climate it
// Drains at the rate of leaving an area. Full at the step's end, it deals its share of max HP and the flat amount for each
// Interval it has stayed full, the time short of the next carried over, and anything else clears that time
export const stepSheerCold = (
  sheerCold: SheerCold,
  { antiColdRatio, isHeated, isInCold, isSwimming, maxHealth }: SheerColdStep,
  stepSeconds: number,
): { damage: number; sheerCold: SheerCold } => {
  let rate = -SHEER_COLD_LEAVE_DRAIN_PER_SECOND;
  if (isHeated) rate = -SHEER_COLD_HEAT_DRAIN_PER_SECOND;
  else if (isInCold)
    rate = SHEER_COLD_GAIN_PER_SECOND * Math.max(0, 1 + (isSwimming ? SHEER_COLD_SWIM_MODIFIER : 0) + antiColdRatio);
  const value = Math.min(SHEER_COLD_MAXIMUM, Math.max(0, sheerCold.value + rate * stepSeconds));
  if (value < SHEER_COLD_MAXIMUM) return { damage: 0, sheerCold: { damageSeconds: 0, value } };
  const seconds = sheerCold.damageSeconds + stepSeconds;
  const intervals = Math.floor(seconds / SHEER_COLD_DAMAGE_INTERVAL_SECONDS);
  return {
    damage: intervals * (SHEER_COLD_DAMAGE_SHARE * maxHealth + SHEER_COLD_DAMAGE_FLAT),
    sheerCold: { damageSeconds: seconds - intervals * SHEER_COLD_DAMAGE_INTERVAL_SECONDS, value },
  };
};
