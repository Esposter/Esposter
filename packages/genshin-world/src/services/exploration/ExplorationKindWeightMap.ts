import { ExplorationKind } from "#src/models/exploration/ExplorationKind";

// The weight each kind of placed doing adds to its area's done weight.
// A camp, a chest and a waypoint take the weight the dump's WorldAreaExploreEventConfigData gives their events.
// Its ExploreWeight is ten on every camp, chest and waypoint row: CLEAR_GROUP_MONSTER, OPEN_CHEST and UNLOCK_POINT.
// Each is that table's own ten. No counted event row is an Oculus or a Puzzle, so their ten is an estimate.
// It stays so until a recording of the map's steps measures it
export const ExplorationKindWeightMap: Record<ExplorationKind, number> = {
  [ExplorationKind.Camp]: 10,
  [ExplorationKind.Chest]: 10,
  [ExplorationKind.Oculus]: 10,
  [ExplorationKind.Puzzle]: 10,
  [ExplorationKind.Waypoint]: 10,
};
