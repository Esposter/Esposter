import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useDialogStore } from "@/store/dungeons/dialog";

export const PlayerPostAttackCheck: State<StateName> = {
  name: StateName.PlayerPostAttackCheck,
  onEnter: () => {
    const dialogStore = useDialogStore();
    const { updateQueuedMessagesAndShowMessage } = dialogStore;
    const enemyStore = useEnemyStore();
    const { activeMonster, isActiveMonsterFainted } = storeToRefs(enemyStore);
    const battleDialogTarget = useBattleDialogTarget();

    if (isActiveMonsterFainted.value) {
      useMonsterDeathTween(true, () =>
        updateQueuedMessagesAndShowMessage(
          battleDialogTarget,
          [`Wild ${activeMonster.value.name} has fainted!`, "You have gained some experience."],
          () => battleStateMachine.setState(StateName.Finished),
        ),
      );
      return;
    }

    battleStateMachine.setState(StateName.EnemyAttack);
  },
};
