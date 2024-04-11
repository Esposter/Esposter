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
    const { attackStatePriorityMap } = storeToRefs(actionStore);

    if (isActiveMonsterFainted.value) {
      useMonsterDeathTween(true, () => {
        showMessages([`Wild ${activeMonster.value.name} has fainted!`, "You have gained some experience."], () => {
          battleStateMachine.setState(StateName.Finished);
        });
      });
      return;
    } else battleStateMachine.setState(attackStatePriorityMap.value[StateName.PlayerPostAttackCheck]);
  },
};
