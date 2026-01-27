import type { State } from "@/models/dungeons/state/State";

import { dayjs } from "#shared/services/dayjs";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { getAttack } from "@/services/dungeons/attack/getAttack";
import { calculateDamage } from "@/services/dungeons/monster/calculateDamage";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { getRandomValue } from "@/util/math/random/getRandomValue";
import { prettify } from "@/util/text/prettify";
import { sleep } from "vue-phaserjs";

export const EnemyAttack: State<StateName> = {
  name: StateName.EnemyAttack,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessageNoInputRequired } = battleDialogStore;
    const takeDamage = useTakeDamage(false);
    const enemyStore = useEnemyStore();
    const { activeMonster } = storeToRefs(enemyStore);
    const randomAttackId = getRandomValue(activeMonster.value.attackIds);
    const randomAttack = getAttack(randomAttackId);

    await showMessageNoInputRequired(
      scene,
      `Enemy ${prettify(activeMonster.value.key)} used ${prettify(randomAttackId)}.`,
    );
    await sleep(scene, dayjs.duration(0.5, "seconds").asMilliseconds());
    await useAttackAnimation(scene, randomAttack, false);
    await takeDamage(calculateDamage(activeMonster.value.stats.attack));
    await battleStateMachine.setState(StateName.EnemyPostAttackCheck);
  },
};
