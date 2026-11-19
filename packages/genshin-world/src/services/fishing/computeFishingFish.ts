import type { FishingCast } from "#src/models/fishing/FishingCast";
import type { FishingFish } from "#src/models/fishing/FishingFish";
import type { FishingPointPlace } from "#src/models/fishing/FishingPointPlace";
import type { FishGeometryOptions } from "genshin-engine";

import { FishingPhase } from "#src/models/fishing/FishingPhase";
import { computeFamilyShape } from "#src/services/fishing/computeFamilyShape";
import { computeFishStandIn } from "#src/services/fishing/computeFishStandIn";

// The fish hooked at the lure while the reel holds it, drawn at the point the line is out to, with its fitted body when a
// Fit has written one and its category's stand-in until then. Nothing is drawn before the strike hooks the fish
export const computeFishingFish = ({
  cast,
  fitted,
  point,
}: {
  cast: Pick<FishingCast, "fish" | "phase"> | undefined;
  fitted?: FishGeometryOptions | undefined;
  point: FishingPointPlace | undefined;
}): FishingFish | undefined => {
  if (cast?.phase !== FishingPhase.Reeling || point === undefined) return undefined;
  return { position: point.position, shape: computeFamilyShape(fitted, computeFishStandIn(cast.fish.fishCateId)) };
};
