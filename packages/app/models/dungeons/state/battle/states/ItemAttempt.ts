import type { State } from "@/models/dungeons/state/State";
import type { PhaserEvents } from "@/services/phaser/events";
import type { EventEmitter } from "eventemitter3";

import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";

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
  onEnter: (battleScene) => {
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const { launchScene, removeScene } = usePreviousScene(battleScene.scene.key);

    usePhaserListener("useItem", async (scene, item, monster) => {
      const { switchToPreviousScene } = usePreviousScene(scene.scene.key);
      // We assume here that you can only use an item in a separate scene
      // other than inventory, and that once you've used an item in battle
      // you cannot use another item, so we remove the inventory scene
      removeScene(scene, SceneKey.Inventory);
      switchToPreviousScene(scene);
      await showMessages(battleScene, [`You used ${item.id} on ${monster.key}.`]);
      await battleStateMachine.setState(StateName.EnemyInput);
    });
    usePhaserListener("unuseItem", async () => {
      await battleStateMachine.setState(StateName.PlayerInput);
    });

    launchScene(battleScene, SceneKey.Inventory);
  },
  onExit: () => {
    for (const unsubscribe of unsubscribes) unsubscribe();
    unsubscribes = [];
  },
};
