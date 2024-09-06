import type { State } from "@/models/dungeons/state/State";
import type { PhaserEvents } from "@/services/phaser/events";
import type { EventEmitter } from "eventemitter3";

import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useSceneStore } from "@/store/dungeons/scene";

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

    usePhaserListener("useItem", async (scene, item, monster, onComplete) => {
      const sceneStore = useSceneStore();
      const { previousSceneKey, previousSceneKeyStack } = storeToRefs(sceneStore);
      const { switchToPreviousScene } = usePreviousScene(scene.scene.key);
      // Remove all in-between scenes until we can switch directly back to the battle scene
      // to avoid epilepsy flashing of multiple scenes when switching
      for (let i = 0; i < previousSceneKeyStack.value.length && previousSceneKey.value !== SceneKey.Battle; i++)
        removeScene(scene, previousSceneKey.value);
      switchToPreviousScene(scene);
      await showMessages(battleScene, [`You used ${item.id} on ${monster.key}.`]);
      await onComplete();
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
