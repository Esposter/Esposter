import type { QuestObjectiveKind } from "#src/models/quest/QuestObjectiveKind";

// Something the Traveler did that a quest's objective may be waiting on: a talk ended, an enemy defeated, an item
// Collected, a thing acted on or a place reached, by the id an objective names it with
export interface QuestEvent {
  kind: QuestObjectiveKind;
  targetId: string;
}
