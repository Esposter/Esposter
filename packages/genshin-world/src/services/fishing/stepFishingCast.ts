import type { FishingCast } from "#src/models/fishing/FishingCast";

import { FishingPhase } from "#src/models/fishing/FishingPhase";
import { computeFishingZone } from "#src/services/fishing/computeFishingZone";
import { stepFishingBite } from "#src/services/fishing/stepFishingBite";
import { stepFishingReel } from "#src/services/fishing/stepFishingReel";

// The cast after `seconds`. A fish nibbles and bites until it is struck: a strike on a biting fish starts the reel, and a
// Strike on a nibbling one, or a bite left past its timeout, ends the cast back at aiming. Once reeled, the tension is held
// Against the zone the travel gives at the reel's seconds, and a cast that is caught or lost ends there
export const stepFishingCast = (
  cast: FishingCast,
  { isReeling, isStruck, seconds }: { isReeling: boolean; isStruck: boolean; seconds: number },
): FishingCast => {
  if (cast.phase === FishingPhase.Waiting || cast.phase === FishingPhase.Biting) {
    const { bite, phase } = stepFishingBite(cast.bite, { biteTimeout: cast.fish.biteTimeout, isStruck, seconds });
    if (phase !== FishingPhase.Reeling) return { ...cast, bite, phase };
    return { ...cast, bite, phase, reel: { ...cast.reel, phase }, reelSeconds: 0 };
  }
  if (cast.phase !== FishingPhase.Reeling) return cast;
  const reelSeconds = cast.reelSeconds + seconds;
  const reel = stepFishingReel(cast.reel, {
    gear: cast.gear,
    isReeling,
    rod: cast.rod,
    seconds,
    zone: computeFishingZone(cast.travel, reelSeconds),
  });
  return { ...cast, phase: reel.phase, reel, reelSeconds };
};
