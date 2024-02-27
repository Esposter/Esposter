import { Grid } from "@/models/dungeons/Grid";
import { PlayerSettingsMenuOption } from "@/models/dungeons/settings/menu/PlayerSettingsMenuOption";

const grid = [
  [PlayerSettingsMenuOption["Text Speed"]],
  [PlayerSettingsMenuOption["Battle Scene"]],
  [PlayerSettingsMenuOption["Battle Style"]],
  [PlayerSettingsMenuOption["Sound"]],
  [PlayerSettingsMenuOption["Volume"]],
  [PlayerSettingsMenuOption["Menu Color"]],
  [PlayerSettingsMenuOption["Close"]],
] as const;
export const PlayerSettingsMenuOptionGrid = new Grid<PlayerSettingsMenuOption, typeof grid>(grid);
