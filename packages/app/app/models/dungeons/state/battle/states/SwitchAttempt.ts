import type { State } from "@/models/dungeons/state/State";

import { getSynchronizedFunction } from "#shared/util/function/getSynchronizedFunction";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { checkIsMonsterFainted } from "@/services/dungeons/monster/checkIsMonsterFainted";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { createPhaserSubscriptions } from "@/services/phaser/createPhaserSubscriptions";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { usePlayerStore } from "@/store/dungeons/player";

const { subscribe, unsubscribeAll } = createPhaserSubscriptions();

export const SwitchAttempt: State<StateName> = {
  name: StateName.SwitchAttempt,
  onEnter: async (scene) => {
    const playerStore = usePlayerStore();
    const { player } = storeToRefs(playerStore);
    const battlePlayerStore = useBattlePlayerStore();
    const { switchActiveMonster } = battlePlayerStore;
    const { activeMonster } = storeToRefs(battlePlayerStore);
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;

    if (!player.value.monsters.some(({ id }) => id !== activeMonster.value.id)) {
      await showMessages(scene, ["You have no other monsters in your party..."]);
      await battleStateMachine.setState(StateName.PlayerInput);
      return;
    }

    subscribe(
      "switchMonster",
      getSynchronizedFunction(async (monster) => {
        const isActiveMonsterFainted = checkIsMonsterFainted(activeMonster.value);
        // A fainted active monster has already played its death tween, so don't replay it.
        if (isActiveMonsterFainted) {
          switchActiveMonster(monster.id);
          await battleStateMachine.setState(StateName.BringOutMonster);
        } else {
          await useMonsterDeathTween(false);
          switchActiveMonster(monster.id);
          await battleStateMachine.setState(StateName.SwitchMonster);
        }
      }),
    );
    subscribe(
      "unswitchMonster",
      getSynchronizedFunction(() => battleStateMachine.setState(StateName.PlayerInput)),
    );

    const { launchScene } = usePreviousScene(scene.scene.key);
    launchScene(scene, SceneKey.MonsterParty);
  },
  onExit: () => {
    unsubscribeAll();
  },
};
