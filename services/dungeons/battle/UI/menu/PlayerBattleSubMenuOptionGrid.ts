import { Grid } from "@/models/dungeons/Grid";
import { PlayerBattleSubMenuOption } from "@/models/dungeons/battle/UI/menu/PlayerBattleSubMenuOption";

export const PlayerBattleSubMenuOptionGrid = new Grid(
  [
    [PlayerBattleSubMenuOption.Move1, PlayerBattleSubMenuOption.Move2],
    [PlayerBattleSubMenuOption.Move3, PlayerBattleSubMenuOption.Move4],
  ],
  2,
);
