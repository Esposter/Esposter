import { Grid } from "@/models/dungeons/Grid";
import { PlayerOption } from "@/models/dungeons/title/menu/PlayerOption";

export const PlayerOptionGrid = new Grid(
  [[PlayerOption["New Game"]], [PlayerOption.Continue], [PlayerOption.Options]],
  3,
  1,
);
