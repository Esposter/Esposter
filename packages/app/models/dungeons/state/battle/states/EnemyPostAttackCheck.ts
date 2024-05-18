import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useActionStore } from "@/store/dungeons/battle/action";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";

export const EnemyPostAttackCheck: State<StateName> = {
  name: StateName.EnemyPostAttackCheck,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const battlePlayerStore = useBattlePlayerStore();
    const { activeMonster, isActiveMonsterFainted } = storeToRefs(battlePlayerStore);
    const actionStore = useActionStore();
    const { attackStatePriorityMap } = storeToRefs(actionStore);

    if (isActiveMonsterFainted.value)
      await useMonsterDeathTween(false, async () => {
        await showMessages(
          scene,
          [`${activeMonster.value.key} has fainted!`, "You have no more monsters, escaping to safety..."],
          async () => {
            await battleStateMachine.setState(StateName.Finished);
          },
        );
      });
    else await battleStateMachine.setState(attackStatePriorityMap.value[StateName.EnemyPostAttackCheck]);
  },
};
