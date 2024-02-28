import { Grid } from "@/models/dungeons/Grid";
import { PlayerSettingsMenuOption } from "@/models/dungeons/settings/menu/PlayerSettingsMenuOption";

const grid = [
  [PlayerSettingsMenuOption["Text Speed"], "Slow", "Mid", "Fast"],
  [PlayerSettingsMenuOption.Animations, "On", "Off"],
  [PlayerSettingsMenuOption["Battle Style"], "Set", "Shift"],
  [PlayerSettingsMenuOption.Sound, "On", "Off"],
  [PlayerSettingsMenuOption.Volume],
  [PlayerSettingsMenuOption["Menu Color"]],
  [PlayerSettingsMenuOption.Close],
] as const;
export const PlayerSettingsMenuOptionGrid = new Grid<string, typeof grid>(grid, { x: 1, y: 0 });
