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
// The Paimon menu's transition, read off the English PC client's menu recording (`yt-IegFADn-Lmk-menu-paimon`, 60 frames
// A second): the opening from 35.0 seconds and the closing from 109.0, each frame's side bar and panel alpha taken
// Against the world and the menu's own stills. The side bar's fade is the one that fits a smoothstep (its RMS error
// 0.011 opening, 0.006 closing), starting at 35.75 and ending at 35.91, and at 109.98 and 110.15 closing. The panel
// Fades in across its width together, half way at about 35.95 and done by 36.02, and as the menu closes it goes first,
// Half way at 109.90 and gone by 110.02. The HUD vanishes in about 0.05 seconds at 35.43, and returns over 110.07 to
// 110.48, a third of the way at 110.07 and half at 110.32
export const PAIMON_MENU_FADE_MS = 160;
export const PAIMON_MENU_PANEL_DELAY_MS = 100;
export const PAIMON_MENU_CLOSE_MS = PAIMON_MENU_FADE_MS + PAIMON_MENU_PANEL_DELAY_MS;
// The smoothstep's CSS form, the closest cubic bezier to its fit
export const PAIMON_MENU_EASING = "cubic-bezier(0.42, 0, 0.58, 1)";
// The mirrorings over a dialog frame's middle that turn its top left ornament into each of its four corners', as CSS
// Scales: the frame is symmetric, so one traced ornament stands for every corner
export const MENU_DIALOG_CORNER_SCALES: readonly string[] = ["1 1", "-1 1", "1 -1", "-1 -1"];
