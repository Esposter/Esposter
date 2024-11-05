import type { State } from "@/models/dungeons/state/State";

import { StateName } from "@/models/dungeons/state/battle/StateName";
import { isMonsterFainted } from "@/services/dungeons/monster/isMonsterFainted";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useActionStore } from "@/store/dungeons/battle/action";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { prettify } from "@/util/text/prettify";

export const PlayerPostAttackCheck: State<StateName> = {
  name: StateName.PlayerPostAttackCheck,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const enemyStore = useEnemyStore();
    const { activeMonster } = storeToRefs(enemyStore);
    const actionStore = useActionStore();
    const { attackStatePriorityMap } = storeToRefs(actionStore);

    if (isMonsterFainted(activeMonster.value)) {
      await useMonsterDeathTween(true);
      await showMessages(scene, [`Wild ${prettify(activeMonster.value.key)} has fainted!`]);
      await battleStateMachine.setState(StateName.GainExperience);
    } else await battleStateMachine.setState(attackStatePriorityMap.value[StateName.PlayerPostAttackCheck]);
  },
};
