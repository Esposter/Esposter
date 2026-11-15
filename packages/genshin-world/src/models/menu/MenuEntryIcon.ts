// The Paimon menu's entry icons, each traced from the English PC client's menu
export const MenuEntryIcon = {
  Achievements: "Achievements",
  AdventurerHandbook: "AdventurerHandbook",
  Archive: "Archive",
  BattlePass: "BattlePass",
  Character: "Character",
  CharacterArchive: "CharacterArchive",
  Community: "Community",
  CoOp: "CoOp",
  Events: "Events",
  Feedback: "Feedback",
  Friends: "Friends",
  Inventory: "Inventory",
  Map: "Map",
  PartySetup: "PartySetup",
  Quests: "Quests",
  Shop: "Shop",
  Survey: "Survey",
  VersionHighlights: "VersionHighlights",
  Wish: "Wish",
} as const;
export type MenuEntryIcon = (typeof MenuEntryIcon)[keyof typeof MenuEntryIcon];
