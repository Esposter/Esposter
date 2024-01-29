import { Grid } from "@/models/dungeons/Grid";
import { type PlayerAttackOption } from "@/models/dungeons/battle/menu/PlayerAttackOption";

export const getPlayerAttackOptionGrid = (PlayerAttackOptions: PlayerAttackOption[]) =>
  new Grid(
    [
      [PlayerAttackOptions[0], PlayerAttackOptions[1]],
      [PlayerAttackOptions[2], PlayerAttackOptions[3]],
    ],
    2,
  );
