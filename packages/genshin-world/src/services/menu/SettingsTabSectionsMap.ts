import type { SettingRange } from "#src/models/menu/SettingRange";
import type { SettingsRow } from "#src/models/menu/SettingsRow";
import type { SettingsSection } from "#src/models/menu/SettingsSection";
import type { SettingsTab } from "#src/models/menu/SettingsTab";
import type { GameText } from "genshin-text";

import { RangeSetting } from "#src/models/menu/RangeSetting";
import { SettingsRowKind } from "#src/models/menu/SettingsRowKind";
import { SettingsTab as Tab } from "#src/models/menu/SettingsTab";
import { VolumeSetting } from "#src/models/menu/VolumeSetting";
import { CAMERA_DISTANCE_RANGE, CAMERA_SENSITIVITY_RANGE, VOLUME_RANGE } from "#src/services/menu/constants";
import { fillGameTextValues, GameLanguage, GameTextKey, getLanguageDisplayName } from "genshin-text";

const getChoiceRow = (labelKey: GameTextKey, getValue: (gameText: GameText) => string): SettingsRow => ({
  getValue,
  kind: SettingsRowKind.Choice,
  labelKey,
});
const getChoice = (labelKey: GameTextKey, valueKey: GameTextKey): SettingsRow =>
  getChoiceRow(labelKey, (gameText) => gameText[valueKey]);
// A key the world does not rebind, drawn as its key cap
const getKey = (labelKey: GameTextKey, key: string): SettingsRow => getChoiceRow(labelKey, () => key);
const getRange = (labelKey: GameTextKey, setting: RangeSetting, range: SettingRange): SettingsRow => ({
  kind: SettingsRowKind.Range,
  labelKey,
  range,
  setting,
});
const getVolume = (labelKey: GameTextKey, setting: VolumeSetting): SettingsRow => ({
  kind: SettingsRowKind.Volume,
  labelKey,
  range: VOLUME_RANGE,
  setting,
});
// A slider the world does not back, drawn at the value the English PC client's settings show it at
const getUnbackedSlider = (labelKey: GameTextKey, range: SettingRange, value: number): SettingsRow => ({
  kind: SettingsRowKind.Slider,
  labelKey,
  range,
  value,
});
// The rows of each tab built, in the game's order under its headings, with the values the English PC client's settings
// Show in `yt-5EmJX_RyuY8-menu-settings`: the Controls tab at 13 seconds, its Key Bindings at 30, the Graphics tab at
// 144.5 seconds and scrolled to its end at 170, the Audio tab at 178, and the Language tab at 190. The world backs the
// Camera's sensitivities and default distance, the graphics quality, the game language and the three volume settings the
// Audio tab names with the overall Volume; every other row is the clip's, drawn disabled as it stands
export const SettingsTabSectionsMap: Readonly<Partial<Record<SettingsTab, SettingsSection[]>>> = {
  [Tab.Audio]: [
    { headingKey: GameTextKey.SettingsAudioTitle, rows: [getVolume(GameTextKey.SettingsVolume, VolumeSetting.Master)] },
    {
      headingKey: GameTextKey.SettingsAudioBalance,
      rows: [
        getVolume(GameTextKey.SettingsMusicVolume, VolumeSetting.Music),
        getUnbackedSlider(GameTextKey.SettingsDialogueVolume, VOLUME_RANGE, VOLUME_RANGE.max),
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
  [Tab.Controls]: [
    {
      headingKey: GameTextKey.SettingsControlsTitle,
      rows: [getChoice(GameTextKey.SettingsControlType, GameTextKey.SettingsInputTypeKeyboard)],
    },
    {
      headingKey: GameTextKey.SettingsCameraTitle,
      rows: [
        getRange(
          GameTextKey.SettingsHorizontalSensitivity,
          RangeSetting.HorizontalSensitivity,
          CAMERA_SENSITIVITY_RANGE,
        ),
        getRange(GameTextKey.SettingsVerticalSensitivity, RangeSetting.VerticalSensitivity, CAMERA_SENSITIVITY_RANGE),
        getUnbackedSlider(GameTextKey.SettingsAimedHorizontalSensitivity, CAMERA_SENSITIVITY_RANGE, 3),
        getUnbackedSlider(GameTextKey.SettingsAimedVerticalSensitivity, CAMERA_SENSITIVITY_RANGE, 3),
        getChoice(GameTextKey.SettingsCameraYAxisReset, GameTextKey.SettingsOn),
        getChoice(GameTextKey.SettingsCombatCamera, GameTextKey.SettingsOn),
        getRange(GameTextKey.SettingsDefaultCameraDistance, RangeSetting.DefaultDistance, CAMERA_DISTANCE_RANGE),
        getChoice(GameTextKey.SettingsBoatCameraCorrection, GameTextKey.SettingsOnlyWhenNotInCombat),
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
  [Tab.KeyBindings]: [
    {
      headingKey: GameTextKey.SettingsKeyBindingActions,
      rows: [
        getKey(GameTextKey.MoveForward, "W"),
        getKey(GameTextKey.MoveBackward, "S"),
        getKey(GameTextKey.MoveLeft, "A"),
        getKey(GameTextKey.MoveRight, "D"),
        getKey(GameTextKey.SwitchToWalkRun, "Left Ctrl"),
        getKey(GameTextKey.NormalAttack, "Left Click"),
        getKey(GameTextKey.ElementalSkill, "E"),
        getKey(GameTextKey.ElementalBurst, "Q"),
        getKey(GameTextKey.Sprint, "Left Shift"),
        getKey(GameTextKey.Sprint, "Right Click"),
        getKey(GameTextKey.SwitchAimingMode, "R"),
        getKey(GameTextKey.JumpOrMoveUpward, "Space"),
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
