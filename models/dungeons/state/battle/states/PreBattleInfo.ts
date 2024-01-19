import { type BattleScene } from "@/models/dungeons/scenes/BattleScene";
import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { BattleSceneStore } from "@/models/dungeons/store/BattleSceneStore";

export const PreBattleInfo: State<BattleScene, StateName> = {
  name: StateName.PreBattleInfo,
  onEnter: function (this) {
    BattleSceneStore.activeEnemyMonster.playMonsterAppearAnimation(() => {
      BattleSceneStore.activeEnemyMonster.playHealthBarAppearAnimation();
      this.battleMenu.battleSubMenu.infoPanel.updateAndShowMessage(
        [`Wild ${BattleSceneStore.activeEnemyMonster.name} appeared!`],
        () => {
          BattleSceneStore.battleStateMachine.setState(StateName.BringOutMonster);
        },
      );
    });
  },
};
