import type { KitEventKind } from "#src/models/kit/KitEventKind";

// A character generated Nightsoul points, which are the points she gained, as gcsim's generate event reads them
export interface KitNightsoulPointsGainedEvent {
  characterId: number;
  kind: KitEventKind.NightsoulPointsGained;
  points: number;
}
