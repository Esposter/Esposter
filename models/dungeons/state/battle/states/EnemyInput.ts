import { type BattleScene } from "@/models/dungeons/scenes/BattleScene";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { BattleSceneStore } from "@/models/dungeons/store/BattleSceneStore";

export const EnemyInput: State<BattleScene, StateName> = {
  name: StateName.EnemyInput,
  onEnter: function (this) {
    BattleSceneStore.battleStateMachine.setState(StateName.Battle);
  },
};
