import { AnimationsSetting, animationsSettingSchema } from "@/models/dungeons/data/settings/AnimationsSetting";
import { BattleStyleSetting, battleStyleSettingSchema } from "@/models/dungeons/data/settings/BattleStyleSetting";
import { SoundSetting, soundSettingSchema } from "@/models/dungeons/data/settings/SoundSetting";
import { TextSpeedSetting, textSpeedSettingSchema } from "@/models/dungeons/data/settings/TextSpeedSetting";
import { ThemeModeSetting, themeModeSettingSchema } from "@/models/dungeons/data/settings/ThemeModeSetting";
import { SettingsOption } from "@/models/dungeons/settings/SettingsOption";
import { IS_DEVELOPMENT } from "@/util/environment/constants";
import { z } from "zod";

export const InitialSettings = {
  [SettingsOption["Text Speed"]]: TextSpeedSetting.Mid,
  [SettingsOption.Animations]: AnimationsSetting.On,
  [SettingsOption["Battle Style"]]: BattleStyleSetting.Shift,
  [SettingsOption.Sound]: SoundSetting.On,
  [SettingsOption.Volume]: IS_DEVELOPMENT ? 0 : 100,
  [SettingsOption["Theme Mode"]]: ThemeModeSetting.Blue,
};
export type Settings = typeof InitialSettings;

export const settingsSchema = z.object({
  [SettingsOption["Text Speed"]]: textSpeedSettingSchema,
  [SettingsOption.Animations]: animationsSettingSchema,
  [SettingsOption["Battle Style"]]: battleStyleSettingSchema,
  [SettingsOption.Sound]: soundSettingSchema,
  [SettingsOption.Volume]: z.number().int().nonnegative().max(100),
  [SettingsOption["Theme Mode"]]: themeModeSettingSchema,
}) satisfies z.ZodType<Settings>;
