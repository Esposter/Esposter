import { AnimationsSetting } from "#shared/models/dungeons/data/settings/AnimationsSetting";
import { BattleStyleSetting } from "#shared/models/dungeons/data/settings/BattleStyleSetting";
import { SettingsOption } from "#shared/models/dungeons/data/settings/SettingsOption";
import { SoundSetting } from "#shared/models/dungeons/data/settings/SoundSetting";
import { TextSpeedSetting } from "#shared/models/dungeons/data/settings/TextSpeedSetting";

// The rows of the settings menu. Column 0 is each row's option, the columns after it are that option's values
export const SettingsOptionRows = [
  [SettingsOption["Text Speed"], TextSpeedSetting.Slow, TextSpeedSetting.Mid, TextSpeedSetting.Fast],
  [SettingsOption.Animations, AnimationsSetting.On, AnimationsSetting.Off],
  [SettingsOption["Battle Style"], BattleStyleSetting.Set, BattleStyleSetting.Shift],
  [SettingsOption.Sound, SoundSetting.On, SoundSetting.Off],
  [SettingsOption.VolumePercentage],
  [SettingsOption["Theme Mode"]],
  [SettingsOption.Close],
] as const;
