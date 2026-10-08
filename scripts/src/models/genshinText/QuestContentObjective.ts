import type { QuestObjectiveKind } from "genshin-world";

// What a condition type a quest step finishes on asks of the Traveler, and which of its parameters names the target
export interface QuestContentObjective {
  kind: QuestObjectiveKind;
  targetIndex: number;
}
