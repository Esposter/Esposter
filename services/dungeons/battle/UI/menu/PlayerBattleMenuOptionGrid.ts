import { Grid } from "@/models/dungeons/Grid";
import { PlayerBattleMenuOption } from "@/models/dungeons/battle/UI/menu/PlayerBattleMenuOption";

export const PlayerBattleMenuOptionGrid = new Grid(
  [
    [PlayerBattleMenuOption.Fight, PlayerBattleMenuOption.Switch],
    [PlayerBattleMenuOption.Item, PlayerBattleMenuOption.Flee],
  ],
  2,
);
