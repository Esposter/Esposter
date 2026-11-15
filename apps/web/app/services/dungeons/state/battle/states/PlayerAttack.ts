import type { State } from "#src/models/dungeons/state/State";

import { StateName } from "#src/models/dungeons/state/battle/StateName";
import { getDamage } from "#src/services/dungeons/monster/getDamage";
import { battleStateMachine } from "#src/services/dungeons/scene/battle/battleStateMachine";
import { useAttackManagerStore } from "#src/store/dungeons/battle/attackManager";
import { useBattleDialogStore } from "#src/store/dungeons/battle/dialog";
import { useEnemyStore } from "#src/store/dungeons/battle/enemy";
import { useBattlePlayerStore } from "#src/store/dungeons/battle/player";
import { prettify } from "#src/util/text/prettify";
import { sleepScene } from "vue-phaserjs";

export const PlayerAttack: State<typeof StateName.PlayerAttack> = {
  name: StateName.PlayerAttack,
  onEnter: async (scene) => {
    const attackManagerStore = useAttackManagerStore();
    const { playAttack } = attackManagerStore;
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
    await playAttack(scene, attack, true);
    const damage = getDamage(
      activeMonster.value.statistics.attack,
      attack.power,
      enemyActiveMonster.value.statistics.defense,
    );
    await takeDamage(damage);
    await battleStateMachine.setState(StateName.PlayerPostAttackCheck);
  },
};
