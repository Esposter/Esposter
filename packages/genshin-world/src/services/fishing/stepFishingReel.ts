import type { FishingReel } from "#src/models/fishing/FishingReel";

import { FishingPhase } from "#src/models/fishing/FishingPhase";
import { REEL_LOST_OUT_OF_ZONE_SECONDS, REEL_TENSION_RATE } from "#src/services/fishing/constants";

// The reel after `seconds` of reeling a fish: the tension rises while the reel is held and falls while it is not, and
// Inside its zone the rod's attack wears the fish's hit points down, where outside it the line's allowance runs out. The
// Fish is caught at no hit points, and the line breaks once it has lain out of its zone past the allowance. A caught or
// Lost reel is done, so it is returned as it is
export const stepFishingReel = (
  reel: FishingReel,
  {
    attack,
    isReeling,
    seconds,
    zone,
  }: { attack: number; isReeling: boolean; seconds: number; zone: { start: number; width: number } },
): FishingReel => {
  if (reel.phase === FishingPhase.Caught || reel.phase === FishingPhase.Lost) return reel;
  const tension = Math.min(
    1,
    Math.max(0, reel.tension + (isReeling ? REEL_TENSION_RATE : -REEL_TENSION_RATE) * seconds),
  );
  const isInZone = tension >= zone.start && tension <= zone.start + zone.width;
  if (isInZone) {
    const hp = Math.max(0, reel.hp - attack * seconds);
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
