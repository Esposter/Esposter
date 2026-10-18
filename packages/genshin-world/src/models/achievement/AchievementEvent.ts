import type { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";

// A doing the world records that an achievement's trigger may be waiting on: its kind, the id the game's table names it
// With, and how many of it happened, which only a trigger counting the quantity reads. Every other doing is one
export interface AchievementEvent {
  kind: AchievementEventKind;
  quantity: number;
  targetId: string;
}
