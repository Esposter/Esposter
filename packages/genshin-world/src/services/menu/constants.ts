import type { MenuEntryIcon } from "#src/models/menu/MenuEntryIcon";
import type { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";

import { MenuEntryIcon as EntryIcon } from "#src/models/menu/MenuEntryIcon";
import { MenuFrameIcon as FrameIcon } from "#src/models/menu/MenuFrameIcon";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { GameTextKey } from "genshin-text";

// The Paimon menu's contents in the game's order, as the English PC client's menu draws them. The Training Guide is
// Not among them, since no still of the menu the references hold shows it
export const PAIMON_MENU_CONTENTS: readonly { icon: MenuEntryIcon; screenKind: TitledScreenKind }[] = [
  { icon: EntryIcon.Shop, screenKind: ScreenKind.Shop },
  { icon: EntryIcon.PartySetup, screenKind: ScreenKind.PartySetup },
  { icon: EntryIcon.Friends, screenKind: ScreenKind.Friends },
  { icon: EntryIcon.Achievements, screenKind: ScreenKind.Achievements },
  { icon: EntryIcon.Archive, screenKind: ScreenKind.Archive },
  { icon: EntryIcon.CharacterArchive, screenKind: ScreenKind.CharacterArchive },
  { icon: EntryIcon.Character, screenKind: ScreenKind.Character },
  { icon: EntryIcon.Inventory, screenKind: ScreenKind.Inventory },
  { icon: EntryIcon.Quests, screenKind: ScreenKind.Quests },
  { icon: EntryIcon.Map, screenKind: ScreenKind.Map },
  { icon: EntryIcon.Events, screenKind: ScreenKind.Events },
  { icon: EntryIcon.AdventurerHandbook, screenKind: ScreenKind.AdventurerHandbook },
  { icon: EntryIcon.Wish, screenKind: ScreenKind.Wish },
  { icon: EntryIcon.BattlePass, screenKind: ScreenKind.BattlePass },
  { icon: EntryIcon.CoOp, screenKind: ScreenKind.CoOp },
];
// The links out to web pages the menu ends with, drawn disabled, since the world opens no page of their own
export const PAIMON_MENU_LINKS: readonly { icon: MenuEntryIcon; labelKey: GameTextKey }[] = [
  { icon: EntryIcon.Community, labelKey: GameTextKey.Community },
  { icon: EntryIcon.Feedback, labelKey: GameTextKey.Feedback },
];
// The screens its side bar opens, in the game's order between its Back and its Quit Game
export const PAIMON_MENU_SIDE_BAR: readonly { icon: MenuFrameIcon; screenKind: TitledScreenKind }[] = [
  { icon: FrameIcon.PhotoMode, screenKind: ScreenKind.PhotoMode },
  { icon: FrameIcon.Notices, screenKind: ScreenKind.Notices },
  { icon: FrameIcon.Mail, screenKind: ScreenKind.Mail },
  { icon: FrameIcon.Time, screenKind: ScreenKind.Time },
  { icon: FrameIcon.Settings, screenKind: ScreenKind.Settings },
];
