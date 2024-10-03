import type { State } from "@/models/dungeons/state/State";

import { StateName } from "@/models/dungeons/state/battle/StateName";
import { dayjs } from "@/services/dayjs";
import { getAttack } from "@/services/dungeons/attack/getAttack";
import { calculateDamage } from "@/services/dungeons/monster/calculateDamage";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { pickRandomValue } from "@/util/math/random/pickRandomValue";
import { prettifyName } from "@/util/text/prettifyName";
import { sleep } from "vue-phaserjs";

export const EnemyAttack: State<StateName> = {
  name: StateName.EnemyAttack,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessageNoInputRequired } = battleDialogStore;
    const battlePlayerStore = useBattlePlayerStore();
    const { takeDamage } = battlePlayerStore;
    const enemyStore = useEnemyStore();
    const { activeMonster } = storeToRefs(enemyStore);
    const randomAttackId = pickRandomValue(activeMonster.value.attackIds);
    const randomAttack = getAttack(randomAttackId);

    await showMessageNoInputRequired(
      scene,
      `Enemy ${prettifyName(activeMonster.value.key)} used ${prettifyName(randomAttackId)}.`,
    );
    await sleep(scene, dayjs.duration(0.5, "seconds").asMilliseconds());
    await useAttackAnimation(scene, randomAttack, false);
    await takeDamage(calculateDamage(activeMonster.value.stats.attack));
    await battleStateMachine.setState(StateName.EnemyPostAttackCheck);
  },
};
