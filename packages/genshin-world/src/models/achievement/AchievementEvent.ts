import type { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";

// A doing the world records that an achievement's trigger may be waiting on: a quest or a parent quest finished, by the id
// The game's table names it with
export interface AchievementEvent {
  kind: AchievementEventKind;
  targetId: string;
}
