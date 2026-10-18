import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A character's Nightsoul blessing drained points from her over a step, which are the points she consumed
export interface KitNightsoulPointsConsumedEvent {
  characterId: number;
  kind: KitEventKind.NightsoulPointsConsumed;
  points: number;
}
