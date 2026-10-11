import { SettingsTab } from "#src/models/menu/SettingsTab";
import { QualityTier } from "genshin-engine";
import { ENGLISH_GAME_TEXT } from "genshin-text";

// The Graphics tab at its top, the world at the High tier the device was given, in the English words
export const props = {
  defaultQualityTier: QualityTier.High,
  gameText: ENGLISH_GAME_TEXT,
  qualityTier: QualityTier.High,
};
// The Audio tab, its volumes and its other settings
export const variants = { audio: { tab: SettingsTab.Audio } };
