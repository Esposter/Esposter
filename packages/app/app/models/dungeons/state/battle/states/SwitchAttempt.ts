import type { State } from "@/models/dungeons/state/State";
import type { PhaserEvents } from "@/services/phaser/events";
import type { EventEmitter } from "eventemitter3";

import { SceneKey } from "#shared/models/dungeons/keys/SceneKey";
import { getSynchronizedFunction } from "#shared/util/getSynchronizedFunction";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { isMonsterFainted } from "@/services/dungeons/monster/isMonsterFainted";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { usePlayerStore } from "@/store/dungeons/player";

let unsubscribes: (() => void)[] = [];

const usePhaserListener = <TEvent extends EventEmitter.EventNames<PhaserEvents>>(
  event: TEvent,
  listener: EventEmitter.EventListener<PhaserEvents, TEvent>,
) => {
  phaserEventEmitter.on(event, listener);
  unsubscribes.push(() => phaserEventEmitter.off(event, listener));
};

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

    usePhaserListener(
      "switchMonster",
      getSynchronizedFunction(async (monster) => {
        const isActiveMonsterFainted = isMonsterFainted(activeMonster.value);
        // If our active monster has fainted, then the death tween would have already been played
        // So we don't have to play it again
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
    usePhaserListener(
      "unswitchMonster",
      getSynchronizedFunction(() => battleStateMachine.setState(StateName.PlayerInput)),
    );

    const { launchScene } = usePreviousScene(scene.scene.key);
    launchScene(scene, SceneKey.MonsterParty);
  },
  onExit: () => {
    for (const unsubscribe of unsubscribes) unsubscribe();
    unsubscribes = [];
  },
};
