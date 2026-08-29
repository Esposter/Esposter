import type { State } from "@/models/dungeons/state/State";

import { StateName } from "@/models/dungeons/state/battle/StateName";
import { getAttack } from "@/services/dungeons/attack/getAttack";
import { calculateDamage } from "@/services/dungeons/monster/calculateDamage";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { getRandomValue } from "@/util/math/random/getRandomValue";
import { prettify } from "@/util/text/prettify";
import { SECOND } from "@esposter/shared";
import { sleep } from "vue-phaserjs";

export const EnemyAttack: State<StateName> = {
  name: StateName.EnemyAttack,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessageNoInputRequired } = battleDialogStore;
    const takeDamage = useTakeDamage(false);
    const enemyStore = useEnemyStore();
    const { activeMonster } = storeToRefs(enemyStore);
    const battlePlayerStore = useBattlePlayerStore();
    const { activeMonster: playerActiveMonster } = storeToRefs(battlePlayerStore);
    const randomAttackId = getRandomValue(activeMonster.value.attackIds);
    const randomAttack = getAttack(randomAttackId);

    await showMessageNoInputRequired(
      scene,
      `Enemy ${prettify(activeMonster.value.key)} used ${prettify(randomAttackId)}.`,
    );
    await sleep(scene, 0.5 * SECOND);
    await useAttackAnimation(scene, randomAttack, false);
    await takeDamage(
      calculateDamage(activeMonster.value.stats.attack, randomAttack.power, playerActiveMonster.value.stats.defense),
    );
    await battleStateMachine.setState(StateName.EnemyPostAttackCheck);
  },
};
