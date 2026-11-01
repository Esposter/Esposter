import type { Fish } from "#src/models/fishing/Fish";
import type { FishingBite } from "#src/models/fishing/FishingBite";
import type { FishingPhase } from "#src/models/fishing/FishingPhase";
import type { FishingReel } from "#src/models/fishing/FishingReel";
import type { FishingZoneTravel } from "#src/models/fishing/FishingZoneTravel";
import type { FishRod } from "#src/models/fishing/FishRod";

// A cast on a fish from the lure's landing to its end: the fish drawn for it, the stock it came from, the rod and the
// Reel gear, the zone's travel it is fought with, its bite, and once it is struck its reel and the seconds the reel has run for
export interface FishingCast {
  bite: FishingBite;
  fish: Fish;
  gear: { inSpeed: number; outSpeed: number };
  phase: FishingPhase;
  reel: FishingReel;
  reelSeconds: number;
  rod: FishRod;
  stockKey: string;
  travel: FishingZoneTravel;
}
