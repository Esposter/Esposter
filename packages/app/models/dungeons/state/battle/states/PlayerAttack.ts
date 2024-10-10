import type { State } from "@/models/dungeons/state/State";

import { StateName } from "@/models/dungeons/state/battle/StateName";
import { dayjs } from "@/services/dayjs";
import { calculateDamage } from "@/services/dungeons/monster/calculateDamage";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { prettify } from "@/util/text/prettify";
import { sleep } from "vue-phaserjs";

export const PlayerAttack: State<StateName> = {
  name: StateName.PlayerAttack,
  onEnter: async (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessageNoInputRequired } = battleDialogStore;
    const battlePlayerStore = useBattlePlayerStore();
    const { activeMonster } = storeToRefs(battlePlayerStore);
    const attackOptionGrid = useAttackOptionGrid();
    const enemyStore = useEnemyStore();
    const { takeDamage } = enemyStore;
    const attack = attackOptionGrid.value;
    if (!attack) return;

    await showMessageNoInputRequired(scene, `${prettify(activeMonster.value.key)} used ${prettify(attack.id)}.`);
    await sleep(scene, dayjs.duration(0.5, "seconds").asMilliseconds());
    await useAttackAnimation(scene, attack, true);
    await takeDamage(calculateDamage(activeMonster.value.stats.attack));
    await battleStateMachine.setState(StateName.PlayerPostAttackCheck);
  },
};
