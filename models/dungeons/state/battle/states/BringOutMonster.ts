import { type BattleScene } from "@/models/dungeons/scenes/BattleScene";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { BattleSceneStore } from "@/models/dungeons/store/BattleSceneStore";
import { dayjs } from "@/services/dayjs";

export const BringOutMonster: State<BattleScene, StateName> = {
  name: StateName.BringOutMonster,
  onEnter: function (this) {
    this.battleMenu.battleSubMenu.infoPanel.showMessageNoInputRequired(
      `Go ${BattleSceneStore.activePlayerMonster.name}!`,
      () => {
        this.time.delayedCall(dayjs.duration(1.2, "second").asMilliseconds(), () => {
          BattleSceneStore.battleStateMachine.setState(StateName.PlayerInput);
        });
      },
    );
  },
};
