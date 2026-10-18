import type { SettingsRow } from "#src/models/menu/SettingsRow";
import type { SettingsSection } from "#src/models/menu/SettingsSection";
import type { SettingsTab } from "#src/models/menu/SettingsTab";
import type { GameText } from "genshin-text";

import { SettingsRowKind } from "#src/models/menu/SettingsRowKind";
import { SettingsTab as Tab } from "#src/models/menu/SettingsTab";
import { VolumeSetting } from "#src/models/menu/VolumeSetting";
import { fillGameTextValues, GameLanguage, GameTextKey, getLanguageDisplayName } from "genshin-text";

const getChoice = (labelKey: GameTextKey, valueKey: GameTextKey): SettingsRow => ({
  getValue: (gameText: GameText) => gameText[valueKey],
  kind: SettingsRowKind.Choice,
  labelKey,
});
const getVolume = (labelKey: GameTextKey, setting: VolumeSetting): SettingsRow => ({
  kind: SettingsRowKind.Volume,
  labelKey,
  setting,
});
// A volume the world does not back, drawn at the level the English PC client's audio shows it at
const getUnbackedVolume = (labelKey: GameTextKey): SettingsRow => ({
  kind: SettingsRowKind.Slider,
  labelKey,
  volume: 10,
});
// The rows of each tab built, in the game's order under its headings, with the values the English PC client's settings
// Show in `yt-5EmJX_RyuY8-menu-settings`: the Graphics tab at 144.5 seconds and scrolled to its end at 170, the Audio
// Tab at 178, and the Language tab at 190. The world backs the graphics quality, the game language and the three volume
// Settings the Audio tab names with the overall Volume; every other row is the clip's, drawn disabled as it stands
export const SettingsTabSectionsMap: Readonly<Partial<Record<SettingsTab, SettingsSection[]>>> = {
  [Tab.Audio]: [
    { headingKey: GameTextKey.SettingsAudioTitle, rows: [getVolume(GameTextKey.SettingsVolume, VolumeSetting.Master)] },
    {
      headingKey: GameTextKey.SettingsAudioBalance,
      rows: [
        getVolume(GameTextKey.SettingsMusicVolume, VolumeSetting.Music),
        getUnbackedVolume(GameTextKey.SettingsDialogueVolume),
        getVolume(GameTextKey.SettingsSfxVolume, VolumeSetting.Sfx),
      ],
    },
    {
      headingKey: GameTextKey.SettingsOtherSettings,
      rows: [
        getChoice(GameTextKey.SettingsDynamicRange, GameTextKey.SettingsFull),
        getChoice(GameTextKey.SettingsOutputSettings, GameTextKey.SettingsStereoSound),
        getChoice(GameTextKey.SettingsMuteWhenMinimized, GameTextKey.SettingsOff),
      ],
    },
  ],
  [Tab.Graphics]: [
    {
      headingKey: GameTextKey.SettingsGraphicsTitle,
      rows: [
        { kind: SettingsRowKind.Quality, labelKey: GameTextKey.SettingsGraphicsQuality },
        {
          getValue: (gameText) =>
            fillGameTextValues(
              gameText[GameTextKey.SettingsResolution],
              2560,
              1440,
              gameText[GameTextKey.SettingsFullscreen],
            ),
          kind: SettingsRowKind.Choice,
          labelKey: GameTextKey.SettingsDisplayMode,
        },
        {
          kind: SettingsRowKind.Action,
          labelKey: GameTextKey.SettingsBrightness,
          valueKey: GameTextKey.SettingsSetNow,
        },
      ],
    },
    {
      headingKey: GameTextKey.SettingsCustom,
      rows: [
        { getValue: () => "60", kind: SettingsRowKind.Choice, labelKey: GameTextKey.SettingsFps },
        getChoice(GameTextKey.SettingsVSync, GameTextKey.SettingsOn),
        { getValue: () => "1.0", kind: SettingsRowKind.Choice, labelKey: GameTextKey.SettingsRenderResolution },
        getChoice(GameTextKey.SettingsShadowQuality, GameTextKey.SettingsHigh),
        getChoice(GameTextKey.SettingsGlobalIllumination, GameTextKey.SettingsHigh),
        getChoice(GameTextKey.SettingsVisualEffects, GameTextKey.SettingsHigh),
        getChoice(GameTextKey.SettingsSfxQuality, GameTextKey.SettingsHigh),
        getChoice(GameTextKey.SettingsEnvironmentDetail, GameTextKey.SettingsHigh),
        getChoice(GameTextKey.SettingsAntiAliasing, GameTextKey.SettingsFsr),
        getChoice(GameTextKey.SettingsVolumetricFog, GameTextKey.SettingsOn),
        getChoice(GameTextKey.SettingsReflections, GameTextKey.SettingsOn),
        getChoice(GameTextKey.SettingsMotionBlur, GameTextKey.SettingsExtreme),
        getChoice(GameTextKey.SettingsBloom, GameTextKey.SettingsOn),
        getChoice(GameTextKey.SettingsCrowdDensity, GameTextKey.SettingsHigh),
        getChoice(GameTextKey.SettingsCoOpTeammateEffects, GameTextKey.SettingsOn),
        getChoice(GameTextKey.SettingsSubsurfaceScattering, GameTextKey.SettingsHigh),
        // The game has no words for a filter's sample count; it writes the number with an x after it, as the clip shows.
        // Provisional: written alike in every language
        { getValue: () => "8x", kind: SettingsRowKind.Choice, labelKey: GameTextKey.SettingsAnisotropicFiltering },
        getChoice(GameTextKey.SettingsDynamicCharacterResolution, GameTextKey.SettingsOn),
      ],
    },
  ],
  [Tab.Language]: [
    {
      headingKey: GameTextKey.SettingsLanguageTitle,
      rows: [
        { kind: SettingsRowKind.Language, labelKey: GameTextKey.SettingsGameLanguage },
        {
          getValue: (_gameText, language) => getLanguageDisplayName(GameLanguage.English, language),
          kind: SettingsRowKind.Choice,
          labelKey: GameTextKey.SettingsVoiceOverLanguage,
        },
      ],
    },
  ],
};
