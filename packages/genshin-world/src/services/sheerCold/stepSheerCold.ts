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
  SHEER_COLD_SNOWSTORM_MODIFIER,
  SHEER_COLD_SWIM_MODIFIER,
} from "#src/services/sheerCold/constants";

// One step of the gauge over its seconds, written into `sheerCold` in place so a quiet step allocates nothing, and
// Returning the damage it deals. Heat near the character drains it wherever it stands; otherwise the subzero Climate
// Fills it, faster while swimming or in a snowstorm and less under an anti-cold, which stops it at none, and outside
// The Climate it drains at the rate of leaving an area. Full at the step's end, it deals its share of max HP and the
// Flat amount for each Interval it has stayed full, carrying the time short of the next over and clearing it otherwise
export const stepSheerCold = (
  sheerCold: SheerCold,
  { antiColdRatio, isHeated, isInCold, isSnowstorm, isSwimming, maxHealth }: SheerColdStep,
  stepSeconds: number,
): number => {
  let rate = -SHEER_COLD_LEAVE_DRAIN_PER_SECOND;
  if (isHeated) rate = -SHEER_COLD_HEAT_DRAIN_PER_SECOND;
  else if (isInCold)
    rate =
      SHEER_COLD_GAIN_PER_SECOND *
      Math.max(
        0,
        1 +
          (isSwimming ? SHEER_COLD_SWIM_MODIFIER : 0) +
          (isSnowstorm ? SHEER_COLD_SNOWSTORM_MODIFIER : 0) +
          antiColdRatio,
      );
  sheerCold.value = Math.min(SHEER_COLD_MAXIMUM, Math.max(0, sheerCold.value + rate * stepSeconds));
  if (sheerCold.value < SHEER_COLD_MAXIMUM) {
    sheerCold.damageSeconds = 0;
    return 0;
  }
  const seconds = sheerCold.damageSeconds + stepSeconds;
  const intervals = Math.floor(seconds / SHEER_COLD_DAMAGE_INTERVAL_SECONDS);
  sheerCold.damageSeconds = seconds - intervals * SHEER_COLD_DAMAGE_INTERVAL_SECONDS;
  return intervals * (SHEER_COLD_DAMAGE_SHARE * maxHealth + SHEER_COLD_DAMAGE_FLAT);
};
