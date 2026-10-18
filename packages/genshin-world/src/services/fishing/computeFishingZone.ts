import type { FishingZone } from "#src/models/fishing/FishingZone";
import type { FishingZoneTravel } from "#src/models/fishing/FishingZoneTravel";

import { REEL_BAR_MAX } from "#src/services/fishing/constants";

// The zone after `seconds` of its travel: it starts at its offset, moves at its speed for its duration and holds where
// That leaves it, and it is kept within the bar at its width. The offset, speed and duration are drawn by the caller
// From the fish's ranges, as the nibble is, and the travel is provisional until the reel's recording sets it
export const computeFishingZone = (
  { duration, offset, speed, width }: FishingZoneTravel,
  seconds: number,
): FishingZone => {
  const start = offset + speed * Math.min(seconds, duration);
  return { start: Math.min(Math.max(start, 0), REEL_BAR_MAX - width), width };
};
