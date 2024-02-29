import { Grid } from "@/models/dungeons/Grid";
import { AnimationsOption } from "@/models/dungeons/settings/AnimationsOption";
import { BattleStyleOption } from "@/models/dungeons/settings/BattleStyleOption";
import { PlayerSettingsOption } from "@/models/dungeons/settings/PlayerSettingsOption";
import { SoundOption } from "@/models/dungeons/settings/SoundOption";
import { TextSpeedOption } from "@/models/dungeons/settings/TextSpeedOption";

const grid = [
  [PlayerSettingsOption["Text Speed"], TextSpeedOption.Slow, TextSpeedOption.Mid, TextSpeedOption.Fast],
  [PlayerSettingsOption.Animations, AnimationsOption.On, AnimationsOption.Off],
  [PlayerSettingsOption["Battle Style"], BattleStyleOption.Set, BattleStyleOption.Shift],
  [PlayerSettingsOption.Sound, SoundOption.On, SoundOption.Off],
  [PlayerSettingsOption.Volume],
  [PlayerSettingsOption["Menu Color"]],
  [PlayerSettingsOption.Close],
] as const;
export const PlayerSettingsOptionGrid = new Grid<string, typeof grid>(grid, { x: 1, y: 0 });
