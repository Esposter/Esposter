import type { FishingCast } from "#src/models/fishing/FishingCast";

import { FishingPhase } from "#src/models/fishing/FishingPhase";
import { FISHING_SPLASH_SECONDS } from "#src/services/fishing/constants";

// The splash of a strike that caught the bite, as its age from zero to one over its seconds: the reel has only just run
// For a fish that the strike hooked, so a cast still reeling within those seconds is the splash, and none is shown after
export const computeFishingSplash = (
  cast: Pick<FishingCast, "phase" | "reelSeconds"> | undefined,
): { age: number } | undefined => {
  if (cast?.phase !== FishingPhase.Reeling || cast.reelSeconds >= FISHING_SPLASH_SECONDS) return undefined;
  return { age: cast.reelSeconds / FISHING_SPLASH_SECONDS };
};
