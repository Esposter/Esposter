import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useActionStore } from "@/store/dungeons/battle/action";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";

export const PlayerPostAttackCheck: State<StateName> = {
  name: StateName.PlayerPostAttackCheck,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const enemyStore = useEnemyStore();
    const { activeMonster, isActiveMonsterFainted } = storeToRefs(enemyStore);
    const actionStore = useActionStore();
    const { attackStatePriorityMap } = storeToRefs(actionStore);

    if (isActiveMonsterFainted.value) {
      await useMonsterDeathTween(true, async () => {
        await showMessages(
          scene,
          [`Wild ${activeMonster.value.key} has fainted!`, "You have gained some experience."],
          async () => {
            await battleStateMachine.setState(StateName.Finished);
          },
        );
      });
      return;
    } else await battleStateMachine.setState(attackStatePriorityMap.value[StateName.PlayerPostAttackCheck]);
  },
};