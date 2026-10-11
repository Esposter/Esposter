import { SettingsTab } from "#src/models/menu/SettingsTab";
import { GameTextKey } from "genshin-text";

// Each tab's name in the game's words, which the side bar and the header's breadcrumb show
export const SettingsTabGameTextKeyMap: Readonly<Record<SettingsTab, GameTextKey>> = {
  [SettingsTab.Account]: GameTextKey.SettingsAccount,
  [SettingsTab.Audio]: GameTextKey.SettingsAudio,
  [SettingsTab.Controls]: GameTextKey.SettingsControls,
  [SettingsTab.Graphics]: GameTextKey.SettingsGraphics,
  [SettingsTab.KeyBindings]: GameTextKey.SettingsKeyBindings,
  [SettingsTab.Language]: GameTextKey.SettingsLanguage,
  [SettingsTab.Messages]: GameTextKey.SettingsMessages,
  [SettingsTab.Other]: GameTextKey.SettingsOther,
  [SettingsTab.Resources]: GameTextKey.SettingsResources,
};
