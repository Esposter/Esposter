import { AnimationsSetting, animationsSettingSchema } from "#shared/models/dungeons/data/settings/AnimationsSetting";
import { BattleStyleSetting, battleStyleSettingSchema } from "#shared/models/dungeons/data/settings/BattleStyleSetting";
import { SoundSetting, soundSettingSchema } from "#shared/models/dungeons/data/settings/SoundSetting";
import { TextSpeedSetting, textSpeedSettingSchema } from "#shared/models/dungeons/data/settings/TextSpeedSetting";
import { ThemeModeSetting, themeModeSettingSchema } from "#shared/models/dungeons/data/settings/ThemeModeSetting";
import { IS_DEVELOPMENT } from "#shared/util/environment/constants";
import { SettingsOption } from "@/models/dungeons/scene/settings/SettingsOption";
import { z } from "zod";

const InitialSettings = {
  [SettingsOption.Animations]: AnimationsSetting.On,
  [SettingsOption.Sound]: SoundSetting.On,
  [SettingsOption.VolumePercentage]: IS_DEVELOPMENT ? 0 : 100,
  [SettingsOption["Battle Style"]]: BattleStyleSetting.Shift,
  [SettingsOption["Text Speed"]]: TextSpeedSetting.Mid,
  [SettingsOption["Theme Mode"]]: ThemeModeSetting.Blue,
};
export const getInitialSettings = () => structuredClone(InitialSettings);
export type Settings = Record<
  Exclude<SettingsOption, SettingsOption.Close>,
  (typeof InitialSettings)[keyof typeof InitialSettings]
>;

export const settingsSchema = z.object({
  [SettingsOption.Animations]: animationsSettingSchema,
  [SettingsOption.Sound]: soundSettingSchema,
  [SettingsOption.VolumePercentage]: z.number().int().nonnegative().max(100),
  [SettingsOption["Battle Style"]]: battleStyleSettingSchema,
  [SettingsOption["Text Speed"]]: textSpeedSettingSchema,
  [SettingsOption["Theme Mode"]]: themeModeSettingSchema,
}) satisfies z.ZodType<Settings>;
