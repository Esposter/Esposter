import type { State } from "@/models/dungeons/state/State";

import { StateName } from "@/models/dungeons/state/battle/StateName";
import { calculateDamage } from "@/services/dungeons/monster/calculateDamage";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { prettify } from "@/util/text/prettify";
import { SECOND } from "@esposter/shared";
import { sleep } from "vue-phaserjs";

export const PlayerAttack: State<StateName> = {
  name: StateName.PlayerAttack,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessageNoInputRequired } = battleDialogStore;
    const battlePlayerStore = useBattlePlayerStore();
    const { activeMonster } = storeToRefs(battlePlayerStore);
    const enemyStore = useEnemyStore();
    const { activeMonster: enemyActiveMonster } = storeToRefs(enemyStore);
    const attackOptionGrid = useAttackOptionGrid();
    const takeDamage = useTakeDamage(true);
    const attack = attackOptionGrid.value;
    if (!attack) return;

    await showMessageNoInputRequired(scene, `${prettify(activeMonster.value.key)} used ${prettify(attack.id)}.`);
    await sleep(scene, 0.5 * SECOND);
    await useAttackAnimation(scene, attack, true);
    await takeDamage(
      calculateDamage(activeMonster.value.stats.attack, attack.power, enemyActiveMonster.value.stats.defense),
    );
    await battleStateMachine.setState(StateName.PlayerPostAttackCheck);
  },
};
