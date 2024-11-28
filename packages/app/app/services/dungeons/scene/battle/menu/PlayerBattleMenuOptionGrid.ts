import { Grid } from "@/models/dungeons/Grid";
import { PlayerOption } from "@/models/dungeons/scene/battle/menu/PlayerOption";

const grid = [
  [PlayerOption.Fight, PlayerOption.Switch],
  [PlayerOption.Item, PlayerOption.Flee],
] as const;
export const PlayerBattleMenuOptionGrid = new Grid<(typeof grid)[number][number], typeof grid>({ grid });
