import { AnimationsSetting, animationsSettingSchema } from "@/models/dungeons/data/settings/AnimationsSetting";
import { BattleStyleSetting, battleStyleSettingSchema } from "@/models/dungeons/data/settings/BattleStyleSetting";
import { MenuColorSetting, menuColorSettingSchema } from "@/models/dungeons/data/settings/MenuColorSetting";
import { SoundSetting, soundSettingSchema } from "@/models/dungeons/data/settings/SoundSetting";
import { TextSpeedSetting, textSpeedSettingSchema } from "@/models/dungeons/data/settings/TextSpeedSetting";
import { SettingsOption } from "@/models/dungeons/settings/SettingsOption";
import { z } from "zod";

export const InitialSettings = {
  [SettingsOption["Text Speed"]]: TextSpeedSetting.Mid,
  [SettingsOption.Animations]: AnimationsSetting.On,
  [SettingsOption["Battle Style"]]: BattleStyleSetting.Shift,
  [SettingsOption.Sound]: SoundSetting.On,
  [SettingsOption.Volume]: 100,
  [SettingsOption["Menu Color"]]: MenuColorSetting.Blue,
};
export type Settings = typeof InitialSettings;

export const settingsSchema = z.object({
  [SettingsOption["Text Speed"]]: textSpeedSettingSchema,
  [SettingsOption.Animations]: animationsSettingSchema,
  [SettingsOption["Battle Style"]]: battleStyleSettingSchema,
  [SettingsOption.Sound]: soundSettingSchema,
  [SettingsOption.Volume]: z.number().int().nonnegative().max(100),
  [SettingsOption["Menu Color"]]: menuColorSettingSchema,
}) satisfies z.ZodType<Settings>;
