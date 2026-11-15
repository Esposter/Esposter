export const ExploreEventKind = {
  ExploreEventClearGroupMonster: "EXPLORE_EVENT_CLEAR_GROUP_MONSTER",
  ExploreEventOpenChest: "EXPLORE_EVENT_OPEN_CHEST",
  ExploreEventUnlockPoint: "EXPLORE_EVENT_UNLOCK_POINT",
} as const;
export type ExploreEventKind = (typeof ExploreEventKind)[keyof typeof ExploreEventKind];
