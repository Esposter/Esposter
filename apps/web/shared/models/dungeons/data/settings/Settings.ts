import { AnimationsSetting, animationsSettingSchema } from "#shared/models/dungeons/data/settings/AnimationsSetting";
import { BattleStyleSetting, battleStyleSettingSchema } from "#shared/models/dungeons/data/settings/BattleStyleSetting";
import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { SoundSetting, soundSettingSchema } from "#shared/models/dungeons/data/settings/SoundSetting";
import { TextSpeedSetting, textSpeedSettingSchema } from "#shared/models/dungeons/data/settings/TextSpeedSetting";
import { ThemeModeSetting, themeModeSettingSchema } from "#shared/models/dungeons/data/settings/ThemeModeSetting";
import { IS_PRODUCTION } from "#shared/util/environment/constants";
import { z } from "zod";

// The `satisfies` carries the exhaustiveness — every option but Close needs an initial value — while
// `typeof` keeps each key's own type, so a schema wiring one option's value to another fails to compile
const InitialSettings = {
  [SettingsOption.Animations]: AnimationsSetting.On,
  [SettingsOption.Sound]: SoundSetting.On,
  [SettingsOption.VolumePercentage]: IS_PRODUCTION ? 100 : 0,
  [SettingsOption["Battle Style"]]: BattleStyleSetting.Shift,
  [SettingsOption["Text Speed"]]: TextSpeedSetting.Mid,
  [SettingsOption["Theme Mode"]]: ThemeModeSetting.Blue,
} satisfies Record<Exclude<SettingsOption, SettingsOption.Close>, unknown>;
export const getInitialSettings = () => structuredClone(InitialSettings);
export type Settings = typeof InitialSettings;

export const settingsSchema = z.object({
  [SettingsOption.Animations]: animationsSettingSchema,
  [SettingsOption.Sound]: soundSettingSchema,
  [SettingsOption.VolumePercentage]: z.int().nonnegative().max(100),
  [SettingsOption["Battle Style"]]: battleStyleSettingSchema,
  [SettingsOption["Text Speed"]]: textSpeedSettingSchema,
  [SettingsOption["Theme Mode"]]: themeModeSettingSchema,
}) satisfies z.ZodType<Settings>;
