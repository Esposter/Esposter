import type { PhaserEvents } from "@/lib/phaser/events/phaser";
import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/scene/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";
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
    const monsterPartySceneStore = useMonsterPartySceneStore();
    const { activeMonster } = storeToRefs(monsterPartySceneStore);
    const { launchScene, removeScene } = usePreviousScene(scene.scene.key);

    usePhaserListener("useItem", (item, sceneKey) => {
      const { switchToPreviousScene } = usePreviousScene(sceneKey);
      // We assume here that you can only use an item in a separate scene
      // other than inventory, and that once you've used an item in battle
      // you cannot use another item, so we remove the inventory scene
      removeScene(scene, SceneKey.Inventory);
      switchToPreviousScene(scene);
      showMessages(scene, [`You used ${item.id} on ${activeMonster.value.key}.`], () => {
        battleStateMachine.setState(StateName.EnemyInput);
      });
    });
    usePhaserListener("unuseItem", () => {
      battleStateMachine.setState(StateName.PlayerInput);
    });

    launchScene(scene, SceneKey.Inventory);
  },
  onExit: () => {
    for (const unsubscribe of unsubscribes) unsubscribe();
    unsubscribes = [];
  },
};
