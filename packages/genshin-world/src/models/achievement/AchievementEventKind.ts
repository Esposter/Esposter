// The kinds of doing an achievement watches for: a quest's own id finished, or a parent quest's, the main quest that holds
// Its sub-quests, finished once its last sub-quest is
export enum AchievementEventKind {
  ParentQuestFinished = "ParentQuestFinished",
  QuestFinished = "QuestFinished",
}
