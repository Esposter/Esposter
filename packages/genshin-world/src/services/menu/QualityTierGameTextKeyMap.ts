import { QualityTier } from "genshin-engine";
import { GameTextKey } from "genshin-text";

// Each quality tier's name in the game's words, as the settings' Graphics Quality row shows it
export const QualityTierGameTextKeyMap: Readonly<Record<QualityTier, GameTextKey>> = {
  [QualityTier.High]: GameTextKey.SettingsHigh,
  [QualityTier.Low]: GameTextKey.SettingsLow,
  [QualityTier.Medium]: GameTextKey.SettingsMedium,
};
