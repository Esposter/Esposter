import type { State } from "#src/models/dungeons/state/State";

import { StateName } from "#src/models/dungeons/state/battle/StateName";
import { getAttack } from "#src/services/dungeons/attack/getAttack";
import { getDamage } from "#src/services/dungeons/monster/getDamage";
import { battleStateMachine } from "#src/services/dungeons/scene/battle/battleStateMachine";
import { useAttackManagerStore } from "#src/store/dungeons/battle/attackManager";
import { useBattleDialogStore } from "#src/store/dungeons/battle/dialog";
import { useEnemyStore } from "#src/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "#src/store/dungeons/battle/player";
import { getRandomValue } from "#src/util/math/random/getRandomValue";
import { prettify } from "#src/util/text/prettify";
import { sleepScene } from "vue-phaserjs";

export const EnemyAttack: State<typeof StateName.EnemyAttack> = {
  name: StateName.EnemyAttack,
  onEnter: async (scene) => {
    const attackManagerStore = useAttackManagerStore();
    const { playAttack } = attackManagerStore;
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
    await sleepScene(scene, 500);
    await playAttack(scene, randomAttack, false);
    const damage = getDamage(
      activeMonster.value.statistics.attack,
      randomAttack.power,
      playerActiveMonster.value.statistics.defense,
    );
    await takeDamage(damage);
    await battleStateMachine.setState(StateName.EnemyPostAttackCheck);
  },
};
