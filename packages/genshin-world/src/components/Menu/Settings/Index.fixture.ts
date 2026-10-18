import { SettingsTab } from "#src/models/menu/SettingsTab";
import { GENSHIN_SETTINGS_DEFAULTS } from "#src/services/menu/constants";
import { QualityTier } from "genshin-engine";
import { ENGLISH_GAME_TEXT, GameLanguage } from "genshin-text";

// The Graphics tab at its top, the world at the High tier the device was given, in the English words, with the device's
// Settings at their defaults
export const props = {
  defaultQualityTier: QualityTier.High,
  gameText: ENGLISH_GAME_TEXT,
  language: GameLanguage.English,
  settings: { ...GENSHIN_SETTINGS_DEFAULTS },
};
// The Audio tab, its volumes and its other settings
export const variants = { audio: { tab: SettingsTab.Audio } };
