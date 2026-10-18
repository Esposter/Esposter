import type { ExplorationArea } from "#src/models/exploration/ExplorationArea";
import type { ExplorationDoing } from "#src/models/exploration/ExplorationDoing";
import type { ExplorationKind } from "#src/models/exploration/ExplorationKind";
import type { Catalogue } from "#src/models/world/Catalogue";
import type { GroundPoint } from "genshin-engine";

import { ExplorationKindWeightMap } from "#src/services/exploration/ExplorationKindWeightMap";
import { findAreaAt } from "#src/services/map/findAreaAt";

// A doing the world places at a point: a chest, an Oculus, a puzzle or a camp, by the id the save records it under
export interface PlacedDoing {
  id: string;
  kind: ExplorationKind;
  position: GroundPoint;
}

// Adds each placed doing to the area its point stands in by the catalogue's outlines, weighted by its kind. A placed doing
// Standing in none of the areas adds to none, so the four level-one areas count only what stands in them
export const placeExplorationDoings = (
  areas: readonly ExplorationArea[],
  catalogue: Catalogue,
  placedDoings: readonly PlacedDoing[],
): ExplorationArea[] => {
  const placed = placedDoings.flatMap(({ id, kind, position }) => {
    const areaId = findAreaAt(catalogue, position.x, position.z)?.id;
    if (areaId === undefined) return [];
    const doing: ExplorationDoing = { id, kind, weight: ExplorationKindWeightMap[kind] };
    return [{ areaId, doing }];
  });
  return areas.map((area) => ({
    ...area,
    doings: [...area.doings, ...placed.filter(({ areaId }) => areaId === area.areaId).map(({ doing }) => doing)],
  }));
};
