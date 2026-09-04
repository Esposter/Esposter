import type { State } from "@/models/dungeons/state/State";

import { StateName } from "@/models/dungeons/state/battle/StateName";
import { getDamage } from "@/services/dungeons/monster/getDamage";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useEnemyStore } from "@/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { prettify } from "@/util/text/prettify";
import { sleepScene } from "vue-phaserjs";

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
    await sleepScene(scene, 500);
    await useAttackAnimation(scene, attack, true);
    await takeDamage(
      getDamage(activeMonster.value.statistics.attack, attack.power, enemyActiveMonster.value.statistics.defense),
    );
    await battleStateMachine.setState(StateName.PlayerPostAttackCheck);
  },
};
