import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import type { PhaserEvents } from "@/services/phaser/events";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useBattlePlayerStore } from "@/store/dungeons/battle/player";
import { usePlayerStore } from "@/store/dungeons/player";
import type { EventEmitter } from "eventemitter3";

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
    const { activeMonster } = storeToRefs(battlePlayerStore);
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;

    if (!player.value.monsters.some(({ id }) => id !== activeMonster.value.id)) {
      await showMessages(scene, ["You have no other monsters in your party..."], async () => {
        await battleStateMachine.setState(StateName.PlayerInput);
      });
      return;
    }

    usePhaserListener("switchMonster", async (monster) => {
      await useMonsterDeathTween(false, async () => {
        activeMonster.value = monster;
        await battleStateMachine.setState(StateName.SwitchMonster);
      });
    });
    usePhaserListener("unswitchMonster", async () => {
      await battleStateMachine.setState(StateName.PlayerInput);
    });

    const { launchScene } = usePreviousScene(scene.scene.key);
    launchScene(scene, SceneKey.MonsterParty);
  },
  onExit: () => {
    for (const unsubscribe of unsubscribes) unsubscribe();
    unsubscribes = [];
  },
};
