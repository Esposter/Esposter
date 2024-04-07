import { Grid } from "@/models/dungeons/Grid";
import { AnimationsSetting } from "@/models/dungeons/data/settings/AnimationsSetting";
import { BattleStyleSetting } from "@/models/dungeons/data/settings/BattleStyleSetting";
import { SoundSetting } from "@/models/dungeons/data/settings/SoundSetting";
import { TextSpeedSetting } from "@/models/dungeons/data/settings/TextSpeedSetting";
import { SettingsOption } from "@/models/dungeons/settings/SettingsOption";

const grid = [
  [SettingsOption["Text Speed"], TextSpeedSetting.Slow, TextSpeedSetting.Mid, TextSpeedSetting.Fast],
  [SettingsOption.Animations, AnimationsSetting.On, AnimationsSetting.Off],
  [SettingsOption["Battle Style"], BattleStyleSetting.Set, BattleStyleSetting.Shift],
  [SettingsOption.Sound, SoundSetting.On, SoundSetting.Off],
  [SettingsOption.Volume],
  [SettingsOption["Theme Mode"]],
  [SettingsOption.Close],
] as const;
export const SettingsOptionGrid = new Grid<(typeof grid)[number][number], typeof grid>(grid, false, { x: 2, y: 0 });
