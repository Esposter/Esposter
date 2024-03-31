import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";

export const PlayerPostAttackCheck: State<StateName> = {
  name: StateName.PlayerPostAttackCheck,
  onEnter: () => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const enemyStore = useEnemyStore();
    const { activeMonster, isActiveMonsterFainted } = storeToRefs(enemyStore);

    if (isActiveMonsterFainted.value) {
      useMonsterDeathTween(true, () => {
        showMessages([`Wild ${activeMonster.value.name} has fainted!`, "You have gained some experience."], () => {
          battleStateMachine.setState(StateName.Finished);
        });
      });
      return;
    }

    battleStateMachine.setState(StateName.EnemyAttack);
  },
};
