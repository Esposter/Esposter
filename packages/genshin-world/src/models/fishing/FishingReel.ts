import type { FishingPhase } from "#src/models/fishing/FishingPhase";

// The reel of a fish on the line: its phase, its hit points left, the tension held on the line in [0, 1], and how long
// The tension has been out of its zone, so the line breaks past the allowance
export interface FishingReel {
  hp: number;
  outOfZoneSeconds: number;
  phase: FishingPhase;
  tension: number;
}
