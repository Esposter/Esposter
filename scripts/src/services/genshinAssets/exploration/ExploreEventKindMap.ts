import { ExplorationKind } from "genshin-world";

// The event types the exploration progress counts, each as its kind. The types the table also lists, gathered items and
// A force entered, are not among the kinds the progress is read from, so they are left out
export const ExploreEventKindMap: Partial<Record<string, ExplorationKind>> = {
  EXPLORE_EVENT_CLEAR_GROUP_MONSTER: ExplorationKind.Camp,
  EXPLORE_EVENT_OPEN_CHEST: ExplorationKind.Chest,
  EXPLORE_EVENT_UNLOCK_POINT: ExplorationKind.Waypoint,
};
