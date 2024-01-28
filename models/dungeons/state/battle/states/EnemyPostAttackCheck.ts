import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { BattleSceneStore } from "@/models/dungeons/store/BattleSceneStore";

export const EnemyPostAttackCheck: State<StateName> = {
  name: StateName.EnemyPostAttackCheck,
  onEnter: function (this) {
    if (BattleSceneStore.activePlayerMonster.isFainted) {
      BattleSceneStore.activePlayerMonster.playDeathAnimation(() => {
        this.battleMenu.battleSubMenu.infoPanel.updateAndShowMessage(
          [
            `${BattleSceneStore.activePlayerMonster.name} has fainted!`,
            "You have no more monsters, escaping to safety...",
          ],
          () => {
            BattleSceneStore.battleStateMachine.setState(StateName.Finished);
          },
        );
      });
      return;
    }

    BattleSceneStore.battleStateMachine.setState(StateName.PlayerInput);
  },
};
