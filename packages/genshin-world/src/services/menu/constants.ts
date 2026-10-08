import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";

import { ScreenKind } from "#src/models/screen/ScreenKind";

// The Paimon menu's contents in the game's order, its links out to web pages left out
export const PAIMON_MENU_CONTENTS: readonly TitledScreenKind[] = [
  ScreenKind.Shop,
  ScreenKind.PartySetup,
  ScreenKind.Friends,
  ScreenKind.Achievements,
  ScreenKind.Archive,
  ScreenKind.CharacterArchive,
  ScreenKind.Character,
  ScreenKind.TrainingGuide,
  ScreenKind.Inventory,
  ScreenKind.Quests,
  ScreenKind.Map,
  ScreenKind.Events,
  ScreenKind.AdventurerHandbook,
  ScreenKind.Wish,
  ScreenKind.BattlePass,
  ScreenKind.CoOp,
];
// The screens its side bar opens, in the game's order between its Back and its Quit Game
export const PAIMON_MENU_SIDE_BAR: readonly TitledScreenKind[] = [
  ScreenKind.PhotoMode,
  ScreenKind.Notices,
  ScreenKind.Mail,
  ScreenKind.Time,
  ScreenKind.Settings,
];
