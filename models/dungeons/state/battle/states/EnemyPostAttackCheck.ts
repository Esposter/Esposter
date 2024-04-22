import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useActionStore } from "@/store/dungeons/battle/action";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";

export const EnemyPostAttackCheck: State<StateName> = {
  name: StateName.EnemyPostAttackCheck,
  onEnter: () => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const battlePlayerStore = useBattlePlayerStore();
    const { activeMonster, isActiveMonsterFainted } = storeToRefs(battlePlayerStore);
    const actionStore = useActionStore();
    const { attackStatePriorityMap } = storeToRefs(actionStore);

    if (isActiveMonsterFainted.value)
      useMonsterDeathTween(false, () => {
        showMessages(
          [`${activeMonster.value.name} has fainted!`, "You have no more monsters, escaping to safety..."],
          () => {
            battleStateMachine.setState(StateName.Finished);
          },
        );
      });
    else battleStateMachine.setState(attackStatePriorityMap.value[StateName.EnemyPostAttackCheck]);
  },
};
