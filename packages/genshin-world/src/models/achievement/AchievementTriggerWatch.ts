import type { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";

// How a watched trigger type is counted: the kind of doing it takes, the parameter slot its target id or ids sit in, and
// Whether its event advances the count by the event's quantity rather than by one
export interface AchievementTriggerWatch {
  countsQuantity: boolean;
  kind: AchievementEventKind;
  targetSlot: number;
}
