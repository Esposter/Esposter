import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { BattleSceneStore } from "@/models/dungeons/store/BattleSceneStore";

export const PlayerPostAttackCheck: State<StateName> = {
  name: StateName.PlayerPostAttackCheck,
  onEnter: function (this) {
    if (BattleSceneStore.activeEnemyMonster.isFainted) {
      BattleSceneStore.activeEnemyMonster.playDeathAnimation(() => {
        this.battleMenu.battleSubMenu.infoPanel.updateAndShowMessage(
          [`Wild ${BattleSceneStore.activeEnemyMonster.name} has fainted!`, "You have gained some experience."],
          () => {
            BattleSceneStore.battleStateMachine.setState(StateName.Finished);
          },
        );
      });
      return;
    }

    BattleSceneStore.battleStateMachine.setState(StateName.EnemyAttack);
  },
};
