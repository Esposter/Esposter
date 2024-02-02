import { type State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useInfoPanelStore } from "@/store/dungeons/battle/infoPanel";

export const PlayerPostAttackCheck: State<StateName> = {
  name: StateName.PlayerPostAttackCheck,
  onEnter: () => {
    const enemyStore = useEnemyStore();
    const { activeMonster, isActiveMonsterFainted } = storeToRefs(enemyStore);
    const infoPanelStore = useInfoPanelStore();
    const { updateQueuedMessagesAndShowMessage } = infoPanelStore;

    if (isActiveMonsterFainted.value) {
      useMonsterDeathTween(true, () =>
        updateQueuedMessagesAndShowMessage(
          [`Wild ${activeMonster.value.name} has fainted!`, "You have gained some experience."],
          () => battleStateMachine.setState(StateName.Finished),
        ),
      );
      return;
    }

    battleStateMachine.setState(StateName.EnemyAttack);
  },
};
