import type { FishingReel } from "#src/models/fishing/FishingReel";
import type { FishingZone } from "#src/models/fishing/FishingZone";
import type { FishRod } from "#src/models/fishing/FishRod";

import { FishingPhase } from "#src/models/fishing/FishingPhase";
import { REEL_BAR_MAX, REEL_LOST_OUT_OF_ZONE_SECONDS } from "#src/services/fishing/constants";

// The reel after `seconds` of reeling a fish: the tension rises while the reel is held and falls while it is not, at the
// Gear's `inSpeed` while it is inside its zone and at its `outSpeed` outside, and it is kept on the bar. Inside the zone
// The rod's base attack, scaled by its multiplier, wears the fish's hit points down, where outside it the line's allowance runs out, and the state the
// Reel starts the step in decides both. The fish is caught at no hit points, and the line breaks once it has lain out of
// Its zone past the allowance. A caught or lost reel is done, so it is returned as it is
export const stepFishingReel = (
  reel: FishingReel,
  {
    gear,
    isReeling,
    rod,
    seconds,
    zone,
  }: {
    gear: { inSpeed: number; outSpeed: number };
    isReeling: boolean;
    rod: Pick<FishRod, "attackMag" | "baseAttack">;
    seconds: number;
    zone: FishingZone;
  },
): FishingReel => {
  if (reel.phase === FishingPhase.Caught || reel.phase === FishingPhase.Lost) return reel;
  const isInZone = reel.tension >= zone.start && reel.tension <= zone.start + zone.width;
  const rate = isInZone ? gear.inSpeed : gear.outSpeed;
  const tension = Math.min(REEL_BAR_MAX, Math.max(0, reel.tension + (isReeling ? rate : -rate) * seconds));
  if (isInZone) {
    const hp = Math.max(0, reel.hp - rod.baseAttack * rod.attackMag * seconds);
    return { ...reel, hp, outOfZoneSeconds: 0, phase: hp === 0 ? FishingPhase.Caught : FishingPhase.Reeling, tension };
  }
  const outOfZoneSeconds = reel.outOfZoneSeconds + seconds;
  return {
    ...reel,
    outOfZoneSeconds,
    phase: outOfZoneSeconds > REEL_LOST_OUT_OF_ZONE_SECONDS ? FishingPhase.Lost : FishingPhase.Reeling,
    tension,
  };
};
