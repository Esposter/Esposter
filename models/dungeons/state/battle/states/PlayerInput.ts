import { type BattleScene } from "@/models/dungeons/scenes/BattleScene";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";

export const PlayerInput: State<BattleScene, StateName> = {
  name: StateName.PlayerInput,
  onEnter: function (this) {
    this.battleMenu.showPlayerBattleMenu();
  },
};
