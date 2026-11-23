import { ExplorationKind } from "#src/models/exploration/ExplorationKind";

// The weight each kind of placed doing adds to its area's done weight. A camp, a chest and a waypoint take the weight the
// Dump's WorldAreaExploreEventConfigData gives their events: its ExploreWeight is ten on every camp row (CLEAR_GROUP_MONSTER),
// Chest row (OPEN_CHEST) and waypoint row (UNLOCK_POINT), so each is that table's own ten. No counted event row is an Oculus
// Or a Puzzle, so their ten is an estimate until a recording of the map's steps measures it
export const ExplorationKindWeightMap: Record<ExplorationKind, number> = {
  [ExplorationKind.Camp]: 10,
  [ExplorationKind.Chest]: 10,
  [ExplorationKind.Oculus]: 10,
  [ExplorationKind.Puzzle]: 10,
  [ExplorationKind.Waypoint]: 10,
};
