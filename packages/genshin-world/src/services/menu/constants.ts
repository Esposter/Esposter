import type { GenshinSettings } from "#src/models/menu/GenshinSettings";
import type { MenuEntryIcon } from "#src/models/menu/MenuEntryIcon";
import type { MenuFrameIcon } from "#src/models/menu/MenuFrameIcon";
import type { SettingRange } from "#src/models/menu/SettingRange";
import type { SettingsTab } from "#src/models/menu/SettingsTab";
import type { TitledScreenKind } from "#src/models/screen/TitledScreenKind";

import { MenuEntryIcon as EntryIcon } from "#src/models/menu/MenuEntryIcon";
import { MenuFrameIcon as FrameIcon } from "#src/models/menu/MenuFrameIcon";
import { SettingsTab as Tab } from "#src/models/menu/SettingsTab";
import { ScreenKind } from "#src/models/screen/ScreenKind";
import { FOLLOW_CAMERA_DEFAULT_SETTINGS, MINUTES_PER_DAY, QualityTier } from "genshin-engine";
import { GameLanguage, GameTextKey } from "genshin-text";

// A Paimon menu entry that opens a web page, labelled by its game text
interface PaimonMenuLinkEntry {
  icon: MenuEntryIcon;
  labelKey: GameTextKey;
}
// A Paimon menu entry that opens a screen, its icon drawn from the table it sits in
interface PaimonMenuScreenEntry<Icon> {
  icon: Icon;
  screenKind: TitledScreenKind;
}

// The Paimon menu's contents in the game's order, as the English PC client's menu draws them. The Training Guide is not
// among them, since no still of the menu the references hold shows it. Which of them carry a red dot is the host's state
export const PAIMON_MENU_CONTENTS: readonly PaimonMenuScreenEntry<MenuEntryIcon>[] = [
  { icon: EntryIcon.Shop, screenKind: ScreenKind.PaimonsBargains },
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
// The Time screen's advance in game minutes, at least thirty ahead and at most two days, as the game's Time option allows
// The two ornaments the time dial's frame carries, at its top and at its bottom
export const TIME_DIAL_ORNAMENT_POSITIONS: readonly string[] = ["top", "bottom"];
export const TIME_MINIMUM_ADVANCE_MINUTES = 30;
export const TIME_MAXIMUM_ADVANCE_MINUTES = 2 * MINUTES_PER_DAY;
// The links out to web pages the menu ends with, drawn disabled, since the world opens no page of their own
export const PAIMON_MENU_LINKS: readonly PaimonMenuLinkEntry[] = [
  { icon: EntryIcon.Community, labelKey: GameTextKey.Community },
  { icon: EntryIcon.VersionHighlights, labelKey: GameTextKey.VersionHighlights },
  { icon: EntryIcon.Feedback, labelKey: GameTextKey.Feedback },
  { icon: EntryIcon.Survey, labelKey: GameTextKey.Survey },
];
// The screens its side bar opens, in the game's order between its Back and its Quit Game
export const PAIMON_MENU_SIDE_BAR: readonly PaimonMenuScreenEntry<MenuFrameIcon>[] = [
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
// The two tabs the game draws dimmer than the rest, by their identity so a reordered tab list cannot move the dimming
export const SETTINGS_DIMMED_TABS: readonly SettingsTab[] = [Tab.Resources, Tab.Other];
// The width of a list screen's list column in units, the rows and series panels laid across it
export const LIST_SCREEN_WIDTH = 666;

// The levels a volume row's slider runs between, from its lowest to its highest
export const VOLUME_LEVEL_MINIMUM = 1;
export const VOLUME_LEVEL_MAXIMUM = 10;
// The track each volume slider moves across, from its first level to its last
export const VOLUME_RANGE: SettingRange = { max: VOLUME_LEVEL_MAXIMUM, min: VOLUME_LEVEL_MINIMUM, step: 1 };
// The camera's ranges on the wiki's Settings page: the sensitivities from 1 to 5 and the default distance from 4.5 to 6.0.
// The distance's step is provisional until a recording shows the slider's notches
export const CAMERA_SENSITIVITY_RANGE: SettingRange = { max: 5, min: 1, step: 1 };
export const CAMERA_DISTANCE_RANGE: SettingRange = { max: 6, min: 4.5, step: 0.1 };
// The key the settings are kept under on this device, as the game keeps its settings per device
export const GENSHIN_SETTINGS_STORAGE_KEY = "genshin-settings";
// The settings a device starts from before it has kept any of its own: the camera's defaults are the follow camera's
// Provisional ones until the Controls tab's export gives the game's
export const GENSHIN_SETTINGS_DEFAULTS: GenshinSettings = {
  defaultDistance: FOLLOW_CAMERA_DEFAULT_SETTINGS.defaultDistance,
  horizontalSensitivity: FOLLOW_CAMERA_DEFAULT_SETTINGS.horizontalSensitivity,
  language: GameLanguage.English,
  musicVolume: VOLUME_LEVEL_MAXIMUM,
  qualityTier: QualityTier.High,
  sfxVolume: VOLUME_LEVEL_MAXIMUM,
  slopePitch: FOLLOW_CAMERA_DEFAULT_SETTINGS.slopePitch,
  verticalSensitivity: FOLLOW_CAMERA_DEFAULT_SETTINGS.verticalSensitivity,
  volume: VOLUME_LEVEL_MAXIMUM,
};
// The quality tiers the Graphics Quality row lists, from the lowest to the highest, as the wiki's Graphics list orders them
export const GRAPHICS_QUALITY_TIERS: readonly QualityTier[] = [QualityTier.Low, QualityTier.Medium, QualityTier.High];
// The keys the list screens step between their tabs with, by their physical code, as the Q and E marks on their band show
export const LIST_SCREEN_TAB_PREVIOUS_CODE = "KeyQ";
export const LIST_SCREEN_TAB_NEXT_CODE = "KeyE";
