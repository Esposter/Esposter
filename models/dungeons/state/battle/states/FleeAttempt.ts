import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { BattleSceneStore } from "@/models/dungeons/store/BattleSceneStore";

export const FleeAttempt: State<StateName> = {
  name: StateName.FleeAttempt,
  onEnter: function (this) {
    this.battleMenu.battleSubMenu.infoPanel.updateAndShowMessage(["You got away safely!"], () => {
      BattleSceneStore.battleStateMachine.setState(StateName.Finished);
    });
  },
};
