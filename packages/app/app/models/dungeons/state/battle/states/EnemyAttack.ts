import type { State } from "@/models/dungeons/state/State";

import { StateName } from "@/models/dungeons/state/battle/StateName";
import { getAttack } from "@/services/dungeons/attack/getAttack";
import { getDamage } from "@/services/dungeons/monster/getDamage";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { getRandomValue } from "@/util/math/random/getRandomValue";
import { prettify } from "@/util/text/prettify";
import { sleepScene } from "vue-phaserjs";

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
    await sleepScene(scene, 500);
    await useAttackAnimation(scene, randomAttack, false);
    await takeDamage(
      getDamage(
        activeMonster.value.statistics.attack,
        randomAttack.power,
        playerActiveMonster.value.statistics.defense,
      ),
    );
    await battleStateMachine.setState(StateName.EnemyPostAttackCheck);
  },
};
