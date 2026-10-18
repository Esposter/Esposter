// The kinds of doing an achievement watches for: a chest opened by its id, a material gained by its item's id, a
// Frostbearing Tree's level reached by its number, a monster defeated by its kind's id, an item crafted by its combine
// Type, a quest's own id finished, a parent quest's, the main quest that holds
// Its sub-quests, finished once its last sub-quest is, and a transport point unlocked by its id, a waypoint or a statue
export enum AchievementEventKind {
  ChestOpened = "ChestOpened",
  ItemCrafted = "ItemCrafted",
  MaterialObtained = "MaterialObtained",
  MonsterDefeated = "MonsterDefeated",
  OfferingLevelReached = "OfferingLevelReached",
  ParentQuestFinished = "ParentQuestFinished",
  QuestFinished = "QuestFinished",
  TransPointUnlocked = "TransPointUnlocked",
}
