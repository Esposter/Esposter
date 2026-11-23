import type { FishingCast } from "#src/models/fishing/FishingCast";
import type { FishingFish } from "#src/models/fishing/FishingFish";
import type { FishingPointPlace } from "#src/models/fishing/FishingPointPlace";
import type { FishGeometryOptions } from "genshin-engine";

import { FishingPhase } from "#src/models/fishing/FishingPhase";
import { computeFamilyShape } from "#src/services/fishing/computeFamilyShape";
import { FISH_STAND_IN_OPTIONS } from "#src/services/fishing/constants";

// The fish hooked at the lure while the reel holds it, drawn at the point the line is out to, with its fitted body when
// A Fit has written one and the standard stand-in until then. Nothing is drawn before the strike hooks the fish
export const computeFishingFish = ({
  cast,
  fitted,
  point,
}: {
  cast?: Pick<FishingCast, "fish" | "phase"> | undefined;
  fitted?: FishGeometryOptions | undefined;
  point?: FishingPointPlace | undefined;
}): FishingFish | undefined => {
  if (cast?.phase !== FishingPhase.Reeling || point === undefined) return undefined;
  return { position: point.position, shape: computeFamilyShape(fitted, FISH_STAND_IN_OPTIONS) };
};
