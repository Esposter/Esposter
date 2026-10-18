// The kinds of doing an achievement watches for: a chest opened by its id, a material gained by its item's id, a
// Frostbearing Tree's level reached by its number, a monster defeated by its kind's id, an item crafted by its combine
// Type, an item the bag takes in by its id, a quest's own id finished, a parent quest's, the main quest that holds
// Its sub-quests, finished once its last sub-quest is, a transport point unlocked by its id, a waypoint or a statue, and
// A weapon forged by its rarity in stars
export enum AchievementEventKind {
  ChestOpened = "ChestOpened",
  ItemCrafted = "ItemCrafted",
  ItemObtained = "ItemObtained",
  MaterialObtained = "MaterialObtained",
  MonsterDefeated = "MonsterDefeated",
  OfferingLevelReached = "OfferingLevelReached",
  ParentQuestFinished = "ParentQuestFinished",
  QuestFinished = "QuestFinished",
  TransPointUnlocked = "TransPointUnlocked",
  WeaponForged = "WeaponForged",
}
