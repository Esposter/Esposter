import type { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";

// How a watched trigger type is counted: the kind of doing it takes, the parameter slot its target id or ids sit in, and
// Whether its event advances the count by the event's quantity rather than by one. A level trigger names the level to
// Reach in the slot its levelSlot gives, and its event's quantity is the level reached, so the count is that level, not a sum
export interface AchievementTriggerWatch {
  countsQuantity: boolean;
  kind: AchievementEventKind;
  levelSlot?: number;
  targetSlot: number;
}
