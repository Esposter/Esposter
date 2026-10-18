import type { Fish } from "#src/models/fishing/Fish";
import type { FishingCast } from "#src/models/fishing/FishingCast";
import type { FishingZoneTravel } from "#src/models/fishing/FishingZoneTravel";
import type { FishRod } from "#src/models/fishing/FishRod";

import { FishingPhase } from "#src/models/fishing/FishingPhase";

// The cast a lure lands as: the fish drawn for it, the rod, the reel gear and the zone's travel it is fought with, and the
// Bite, whose nibble is drawn by the caller from the fish's feeler times. The reel starts at the fish's hit points, not yet running
export const startFishingCast = ({
  fish,
  gear,
  nibbleSeconds,
  rod,
  travel,
}: {
  fish: Fish;
  gear: { inSpeed: number; outSpeed: number };
  nibbleSeconds: number;
  rod: FishRod;
  travel: FishingZoneTravel;
}): FishingCast => ({
  bite: { elapsedSeconds: 0, nibbleSeconds },
  fish,
  gear,
  phase: FishingPhase.Waiting,
  reel: { hp: fish.hp, outOfZoneSeconds: 0, phase: FishingPhase.Waiting, tension: 0 },
  reelSeconds: 0,
  rod,
  travel,
});
