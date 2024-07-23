import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import type { PhaserEvents } from "@/services/phaser/events";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import type { EventEmitter } from "eventemitter3";

let unsubscribes: (() => void)[] = [];

const usePhaserListener = <TEvent extends EventEmitter.EventNames<PhaserEvents>>(
  event: TEvent,
  listener: EventEmitter.EventListener<PhaserEvents, TEvent>,
) => {
  phaserEventEmitter.on(event, listener);
  unsubscribes.push(() => phaserEventEmitter.off(event, listener));
};

export const ItemAttempt: State<StateName> = {
  name: StateName.ItemAttempt,
  onEnter: (scene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const { launchScene, removeScene } = usePreviousScene(scene.scene.key);

    usePhaserListener("useItem", async (scene, item, monster) => {
      const { switchToPreviousScene } = usePreviousScene(scene.scene.key);
      // We assume here that you can only use an item in a separate scene
      // other than inventory, and that once you've used an item in battle
      // you cannot use another item, so we remove the inventory scene
      removeScene(scene, SceneKey.Inventory);
      switchToPreviousScene(scene);
      await showMessages(scene, [`You used ${item.id} on ${monster.key}.`], async () => {
        await battleStateMachine.setState(StateName.EnemyInput);
      });
    });
    usePhaserListener("unuseItem", async () => {
      await battleStateMachine.setState(StateName.PlayerInput);
    });

    launchScene(scene, SceneKey.Inventory);
  },
  onExit: () => {
    for (const unsubscribe of unsubscribes) unsubscribe();
    unsubscribes = [];
  },
};
