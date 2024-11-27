import { Grid } from "@/models/dungeons/Grid";
import { SettingsOption } from "@/models/dungeons/scene/settings/SettingsOption";
import { AnimationsSetting } from "@/shared/models/dungeons/data/settings/AnimationsSetting";
import { BattleStyleSetting } from "@/shared/models/dungeons/data/settings/BattleStyleSetting";
import { SoundSetting } from "@/shared/models/dungeons/data/settings/SoundSetting";
import { TextSpeedSetting } from "@/shared/models/dungeons/data/settings/TextSpeedSetting";

const grid = [
  [SettingsOption["Text Speed"], TextSpeedSetting.Slow, TextSpeedSetting.Mid, TextSpeedSetting.Fast],
  [SettingsOption.Animations, AnimationsSetting.On, AnimationsSetting.Off],
  [SettingsOption["Battle Style"], BattleStyleSetting.Set, BattleStyleSetting.Shift],
  [SettingsOption.Sound, SoundSetting.On, SoundSetting.Off],
  [SettingsOption.VolumePercentage],
  [SettingsOption["Theme Mode"]],
  [SettingsOption.Close],
] as const;
export const SettingsOptionGrid = new Grid<(typeof grid)[number][number], typeof grid>({
  grid,
  position: ref({ x: 2, y: 0 }),
  // We shouldn't be able to move to the settings option
  validate: ({ x }) => x !== 0,
  wrap: false,
});
