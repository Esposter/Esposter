import { type BattleScene } from "@/models/dungeons/scenes/BattleScene";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { BattleSceneStore } from "@/models/dungeons/store/BattleSceneStore";
import { dayjs } from "@/services/dayjs";

export const Intro: State<BattleScene, StateName> = {
  name: StateName.Intro,
  onEnter: function (this) {
    this.time.delayedCall(dayjs.duration(0.5, "second").asMilliseconds(), () => {
      BattleSceneStore.battleStateMachine.setState(StateName.PreBattleInfo);
    });
  },
};
