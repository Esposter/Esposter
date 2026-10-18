import { QuestKind } from "#src/models/quest/QuestKind";
import { HALF_POINTS_PER_ENCOUNTER_POINT, QUEST_ENCOUNTER_POINTS } from "#src/services/commission/constants";

// The half points a quest's completion earns: an Archon quest or a Story quest gives four Encounter Points, and the other
// Kinds give none, since the amounts of World and Event quests are not settled yet
export const getQuestEncounterHalfPoints = (kind: QuestKind): number =>
  kind === QuestKind.Archon || kind === QuestKind.Story ? QUEST_ENCOUNTER_POINTS * HALF_POINTS_PER_ENCOUNTER_POINT : 0;
