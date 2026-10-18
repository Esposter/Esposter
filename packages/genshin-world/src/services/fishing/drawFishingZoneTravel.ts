import type { Fish } from "#src/models/fishing/Fish";
import type { FishingZoneTravel } from "#src/models/fishing/FishingZoneTravel";
import type { FishRod } from "#src/models/fishing/FishRod";

import { drawFishingRange } from "#src/services/fishing/drawFishingRange";

// The zone's travel drawn when a fish is struck: its offset, speed and duration from the fish's ranges by the caller's
// Random source, and its width the fish's own widened by the rod's accuracy. Provisional, as the travel is
export const drawFishingZoneTravel = (
  {
    bonusDuration,
    bonusOffset,
    bonusSpeed,
    bonusWidth,
  }: Pick<Fish, "bonusDuration" | "bonusOffset" | "bonusSpeed" | "bonusWidth">,
  { attackAcc }: Pick<FishRod, "attackAcc">,
  random: () => number,
): FishingZoneTravel => ({
  duration: drawFishingRange(bonusDuration, random),
  offset: drawFishingRange(bonusOffset, random),
  speed: drawFishingRange(bonusSpeed, random),
  width: bonusWidth * attackAcc,
});
