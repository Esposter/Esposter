import { AchievementEventKind } from "#src/models/achievement/AchievementEventKind";

// The game's trigger types the world watches, each with the kind of doing it counts. An AND trigger names one quest and an
// OR trigger a list, and either counts each named quest's finish once more. A trigger type not listed here is not watched
// Yet, so its achievements never move
export const AchievementTriggerEventKindMap: Readonly<Record<string, AchievementEventKind>> = {
  TRIGGER_FINISH_PARENT_QUEST_AND: AchievementEventKind.ParentQuestFinished,
  TRIGGER_FINISH_PARENT_QUEST_OR: AchievementEventKind.ParentQuestFinished,
  TRIGGER_FINISH_QUEST_AND: AchievementEventKind.QuestFinished,
  TRIGGER_FINISH_QUEST_OR: AchievementEventKind.QuestFinished,
};
