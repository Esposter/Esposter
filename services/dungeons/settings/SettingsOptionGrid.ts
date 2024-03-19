import { Grid } from "@/models/dungeons/Grid";
import { AnimationsOption } from "@/models/dungeons/settings/AnimationsOption";
import { BattleStyleOption } from "@/models/dungeons/settings/BattleStyleOption";
import { SettingsOption } from "@/models/dungeons/settings/SettingsOption";
import { SoundOption } from "@/models/dungeons/settings/SoundOption";
import { TextSpeedOption } from "@/models/dungeons/settings/TextSpeedOption";

const grid = [
  [SettingsOption["Text Speed"], TextSpeedOption.Slow, TextSpeedOption.Mid, TextSpeedOption.Fast],
  [SettingsOption.Animations, AnimationsOption.On, AnimationsOption.Off],
  [SettingsOption["Battle Style"], BattleStyleOption.Set, BattleStyleOption.Shift],
  [SettingsOption.Sound, SoundOption.On, SoundOption.Off],
  [SettingsOption.Volume],
  [SettingsOption["Menu Color"]],
  [SettingsOption.Close],
] as const;
export const SettingsOptionGrid = new Grid<(typeof grid)[number][number], typeof grid>(grid, { x: 2, y: 0 });
