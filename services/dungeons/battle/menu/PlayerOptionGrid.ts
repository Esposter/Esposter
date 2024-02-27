import { Grid } from "@/models/dungeons/Grid";
import { PlayerOption } from "@/models/dungeons/battle/menu/PlayerOption";
// @TODO
export const PlayerOptionGrid = new Grid<PlayerOption, [[PlayerOption, PlayerOption], [PlayerOption, PlayerOption]]>([
  [PlayerOption.Fight, PlayerOption.Switch],
  [PlayerOption.Item, PlayerOption.Flee],
]);
