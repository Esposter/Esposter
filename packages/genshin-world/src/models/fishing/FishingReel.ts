import type { FishingPhase } from "#src/models/fishing/FishingPhase";

// The reel of a fish on the line: its phase, its hit points left, the tension held on the line in the bar's units from
// Zero to its full range, and how long the tension has been out of its zone, so the line breaks past the allowance
export interface FishingReel {
  hp: number;
  outOfZoneSeconds: number;
  phase: FishingPhase;
  tension: number;
}
