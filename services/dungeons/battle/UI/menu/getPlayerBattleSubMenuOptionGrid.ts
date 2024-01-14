import { Grid } from "@/models/dungeons/Grid";
import { type PlayerBattleSubMenuOption } from "@/models/dungeons/battle/UI/menu/PlayerBattleSubMenuOption";

export const getPlayerBattleSubMenuOptionGrid = (playerBattleSubMenuOptions: PlayerBattleSubMenuOption[]) =>
  new Grid(
    [
      [playerBattleSubMenuOptions[0], playerBattleSubMenuOptions[1]],
      [playerBattleSubMenuOptions[2], playerBattleSubMenuOptions[3]],
    ],
    2,
  );
