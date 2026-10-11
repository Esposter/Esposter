import type { MenuEntryIcon } from "#src/models/menu/MenuEntryIcon";
import type { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import type { MenuIconGlyph } from "#src/models/menu/MenuIconGlyph";
import type { SettingsTab } from "#src/models/menu/SettingsTab";
import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";

import { MenuEntryIcon as EntryIcon } from "#src/models/menu/MenuEntryIcon";
import { MenuFrameIcon as FrameIcon } from "#src/models/menu/MenuFrameIcon";
import { SettingsTab as Tab } from "#src/models/menu/SettingsTab";
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
// The mirrorings over a dialog frame's middle that turn its top left ornament into each of its four corners', as CSS
// Scales: the frame is symmetric, so one traced ornament stands for every corner
export const MENU_DIALOG_CORNER_SCALES: readonly string[] = ["1 1", "-1 1", "1 -1", "-1 -1"];
// The settings' tabs in the game's order down its side bar, as the English PC client's settings list them in the world
// (`yt-5EmJX_RyuY8-menu-settings`)
export const SETTINGS_TABS: readonly SettingsTab[] = [
  Tab.Controls,
  Tab.KeyBindings,
  Tab.Graphics,
  Tab.Audio,
  Tab.Messages,
  Tab.Language,
  Tab.Account,
  Tab.Resources,
  Tab.Other,
];

// The list screens' close mark: its X traced at four times off the English client's quest screen at 1920 by 1080
// (`File:Quest Screen.png`), the cream disc's dark hole, its box from the close button's top left
export const MENU_LIST_CLOSE_GLYPH: MenuIconGlyph = {
  height: 72,
  paths: [
    "M 22.25 20 L 21.25 20.75 L 21.25 23.25 L 21.5 23.5 L 21.75 26.75 L 22 27 L 22 28.25 L 22.25 28.75 Q 23.25 29 24 28.25 L 25.25 28.25 L 26.75 29.5 Q 27.25 29.25 27 30 L 27.5 30 L 31 33.75 L 31 34.75 L 27 38.75 L 25.25 40 L 24 40 Q 23.25 39.25 22.25 39.5 L 22 40.25 L 21.75 43.25 L 21.5 43.5 L 21.5 45 L 21.25 45.25 L 21.25 47.75 L 22.25 48.25 Q 23.25 48.5 23.75 48 L 26.75 48 L 27 47.75 L 29 47.75 L 29.75 47.25 Q 30 45.75 29.25 45.5 L 29.25 44.5 L 30.75 42.75 L 35.25 38.5 L 35.75 38.5 L 36.75 39.5 Q 37.25 39.25 37 40 L 37.75 40.25 L 38 41 L 38.75 41.25 L 38.75 41.75 L 41.25 44.5 L 41.25 45.5 L 40.75 46.5 L 40.75 47.25 L 41.75 47.75 L 43.75 47.75 L 44 48 L 47.75 48 L 48 48.25 Q 49.25 48.5 49.5 47.75 L 49.25 44 L 49 43.75 L 49 41.75 L 48.75 41.5 L 48.75 40.25 L 48.5 39.5 L 47.5 39.5 L 46.5 40.25 L 45.5 40 L 45 39.25 L 44.25 39 L 39.75 34.75 L 39.75 33.75 L 45.75 28 L 46.5 28 L 47.5 28.75 L 48.5 28.75 Q 48.25 28 48.75 28 L 48.75 27 L 49 26.75 L 49.25 22.5 L 49.5 22.25 Q 50 20.5 49 20 L 47.25 20 L 47 20.25 L 44.25 20.25 L 44 20.5 L 41.5 20.5 L 40.75 21.25 L 40.75 22 L 41.25 23 L 41.25 24 L 39 26.75 L 38.5 27 L 38 27.75 L 35.75 29.75 L 35 29.75 L 30.75 25.75 L 30 24.75 L 30 24.25 L 29.25 24 L 29.25 23.25 L 29.75 22.25 L 29.75 21.25 L 29 20.5 L 27.5 20.5 L 27.25 20.25 L 23.75 20.25 Q 23.25 19.75 22.25 20 Z",
  ],
  width: 72,
  x: -6,
  y: -5,
};
