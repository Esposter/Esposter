import type { ExplorationKind } from "#src/models/exploration/ExplorationKind";

// The weight each kind of placed doing adds to its area's done weight. Provisional: the game's table gives every camp and
// Chest a weight of ten, and the wiki gives no weight for the others, so each is ten until a recording of the map's
// Steps measures it. A waypoint's weight is the table's own, read on its doing
export const ExplorationKindWeightMap: Record<ExplorationKind, number> = {
  Camp: 10,
  Chest: 10,
  Oculus: 10,
  Puzzle: 10,
  Waypoint: 10,
};
