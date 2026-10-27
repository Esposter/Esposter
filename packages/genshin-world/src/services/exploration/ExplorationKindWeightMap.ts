import { ExplorationKind } from "#src/models/exploration/ExplorationKind";

// The weight each kind of placed doing adds to its area's done weight. Provisional: the game's table gives every camp and
// Chest a weight of ten, and the wiki gives no weight for the others, so each is ten until a recording of the map's
// Steps measures it. A waypoint's weight is the table's own, read on its doing
export const ExplorationKindWeightMap: Record<ExplorationKind, number> = {
  [ExplorationKind.Camp]: 10,
  [ExplorationKind.Chest]: 10,
  [ExplorationKind.Oculus]: 10,
  [ExplorationKind.Puzzle]: 10,
  [ExplorationKind.Waypoint]: 10,
};
