import { type BattleScene } from "@/models/dungeons/scenes/BattleScene";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { BattleSceneStore } from "@/models/dungeons/store/BattleSceneStore";

export const Intro: State<BattleScene, StateName> = {
  name: StateName.Intro,
  onEnter: function (this) {
    BattleSceneStore.battleStateMachine.setState(StateName.PreBattleInfo);
  },
};
