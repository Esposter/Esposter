import type { State } from "#src/models/dungeons/state/State";

import { StateName } from "#src/models/dungeons/state/battle/StateName";
import { checkIsMonsterFainted } from "#src/services/dungeons/monster/checkIsMonsterFainted";
import { battleStateMachine } from "#src/services/dungeons/scene/battle/battleStateMachine";
import { animateMonsterDeath } from "#src/services/dungeons/scene/battle/monster/animateMonsterDeath";
import { useActionStore } from "#src/store/dungeons/battle/action";
import { useBattleDialogStore } from "#src/store/dungeons/battle/dialog";
import { useBattlePlayerStore } from "#src/store/dungeons/battle/player";
import { usePlayerStore } from "#src/store/dungeons/player";
import { prettify } from "#src/util/text/prettify";

export const EnemyPostAttackCheck: State<typeof StateName.EnemyPostAttackCheck> = {
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

    if (checkIsMonsterFainted(activeMonster.value)) {
      await animateMonsterDeath(false);
      const hasStandingMonster = player.value.monsters.some(
        (monster) => monster.id !== activeMonster.value.id && !checkIsMonsterFainted(monster),
      );
      await showMessages(scene, [
        `${prettify(activeMonster.value.key)} has fainted!`,
        hasStandingMonster
          ? "Select another monster to continue the battle."
          : "You have no more monsters, escaping to safety...",
      ]);
      await battleStateMachine.setState(hasStandingMonster ? StateName.SwitchAttempt : StateName.Finished);
    } else await battleStateMachine.setState(attackStatePriorityMap.value[StateName.EnemyPostAttackCheck]);
  },
};
