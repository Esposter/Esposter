import { AnimationsSetting, animationsSettingSchema } from "@/models/dungeons/data/settings/AnimationsSetting";
import { BattleStyleSetting, battleStyleSettingSchema } from "@/models/dungeons/data/settings/BattleStyleSetting";
import { SoundSetting, soundSettingSchema } from "@/models/dungeons/data/settings/SoundSetting";
import { TextSpeedSetting, textSpeedSettingSchema } from "@/models/dungeons/data/settings/TextSpeedSetting";
import { ThemeModeSetting, themeModeSettingSchema } from "@/models/dungeons/data/settings/ThemeModeSetting";
import { SettingsOption } from "@/models/dungeons/scene/settings/SettingsOption";
import { IS_DEVELOPMENT } from "@/util/environment/constants";
import { z } from "zod";

const InitialSettings = {
  [SettingsOption["Text Speed"]]: TextSpeedSetting.Mid,
  [SettingsOption.Animations]: AnimationsSetting.On,
  [SettingsOption["Battle Style"]]: BattleStyleSetting.Shift,
  [SettingsOption.Sound]: SoundSetting.On,
  [SettingsOption.VolumePercentage]: IS_DEVELOPMENT ? 0 : 100,
  [SettingsOption["Theme Mode"]]: ThemeModeSetting.Blue,
} satisfies Record<Exclude<SettingsOption, SettingsOption.Close>, unknown>;
export const getInitialSettings = () => structuredClone(InitialSettings);
export type Settings = typeof InitialSettings;

export const settingsSchema = z.object({
  [SettingsOption["Text Speed"]]: textSpeedSettingSchema,
  [SettingsOption.Animations]: animationsSettingSchema,
  [SettingsOption["Battle Style"]]: battleStyleSettingSchema,
  [SettingsOption.Sound]: soundSettingSchema,
  [SettingsOption.VolumePercentage]: z.number().int().nonnegative().max(100),
  [SettingsOption["Theme Mode"]]: themeModeSettingSchema,
}) satisfies z.ZodType<Settings>;