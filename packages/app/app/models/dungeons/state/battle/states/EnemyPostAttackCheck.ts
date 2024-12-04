import type { State } from "@/models/dungeons/state/State";

import { StateName } from "@/models/dungeons/state/battle/StateName";
import { isMonsterFainted } from "@/services/dungeons/monster/isMonsterFainted";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useActionStore } from "@/store/dungeons/battle/action";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { usePlayerStore } from "@/store/dungeons/player";
import { prettify } from "@/util/text/prettify";

export const EnemyPostAttackCheck: State<StateName> = {
  name: StateName.EnemyPostAttackCheck,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const playerStore = usePlayerStore();
    const { player } = storeToRefs(playerStore);
    const battlePlayerStore = useBattlePlayerStore();
    const { activeMonster } = storeToRefs(battlePlayerStore);
    const actionStore = useActionStore();
    const { attackStatePriorityMap } = storeToRefs(actionStore);

    if (isMonsterFainted(activeMonster.value)) {
      await useMonsterDeathTween(false);
      if (player.value.monsters.some((m) => m.id !== activeMonster.value.id && !isMonsterFainted(m))) {
        await showMessages(scene, [
          `${prettify(activeMonster.value.key)} has fainted!`,
          "Select another monster to continue the battle.",
        ]);
        await battleStateMachine.setState(StateName.SwitchAttempt);
      } else {
        await showMessages(scene, [
          `${prettify(activeMonster.value.key)} has fainted!`,
          "You have no more monsters, escaping to safety...",
        ]);
        await battleStateMachine.setState(StateName.Finished);
      }
    } else await battleStateMachine.setState(attackStatePriorityMap.value[StateName.EnemyPostAttackCheck]);
  },
};
