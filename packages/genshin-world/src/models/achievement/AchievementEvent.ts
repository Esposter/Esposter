import type { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";

// A doing the world records that an achievement's trigger may be waiting on: its kind, the id the game's table names it
// With, and how many of it happened, which only a trigger counting the quantity reads. Every other doing is one. A doing
// Of a two-slot trigger also carries the second id it names, such as a chest's region, when the world knows it
export interface AchievementEvent {
  kind: AchievementEventKind;
  quantity: number;
  scopeId?: string;
  targetId: string;
}
