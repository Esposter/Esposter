import { Grid } from "@/models/dungeons/Grid";
import { PlayerOption } from "@/models/dungeons/battle/UI/menu/PlayerOption";

export const PlayerOptionGrid = new Grid(
  [
    [PlayerOption.Fight, PlayerOption.Switch],
    [PlayerOption.Item, PlayerOption.Flee],
  ],
  2,
);
