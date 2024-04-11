import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useActionStore } from "@/store/dungeons/battle/action";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";

export const PlayerPostAttackCheck: State<StateName> = {
  name: StateName.PlayerPostAttackCheck,
  onEnter: () => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const enemyStore = useEnemyStore();
    const { activeMonster, isActiveMonsterFainted } = storeToRefs(enemyStore);
    const actionStore = useActionStore();
    const { hasPlayerAttacked, hasEnemyAttacked } = storeToRefs(actionStore);

    if (!hasEnemyAttacked.value) {
      battleStateMachine.setState(StateName.EnemyAttack);
      return;
    }

    hasEnemyAttacked.value = false;

    if (isActiveMonsterFainted.value) {
      useMonsterDeathTween(true, () => {
        showMessages([`Wild ${activeMonster.value.name} has fainted!`, "You have gained some experience."], () => {
          battleStateMachine.setState(StateName.Finished);
          hasPlayerAttacked.value = false;
        });
      });
      return;
    }

    battleStateMachine.setState(StateName.PlayerInput);
    hasPlayerAttacked.value = false;
  },
};
