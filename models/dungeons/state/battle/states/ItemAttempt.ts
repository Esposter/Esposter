import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { State } from "@/models/dungeons/state/State";
import { StateName } from "@/models/dungeons/state/battle/StateName";
import { battleStateMachine } from "@/services/dungeons/battle/battleStateMachine";
import { useBattleDialogStore } from "@/store/dungeons/battle/dialog";
import { useItemStore } from "@/store/dungeons/inventory/item";
import { useMonsterPartySceneStore } from "@/store/dungeons/monsterParty/scene";

export const ItemAttempt: State<StateName> = {
  name: StateName.ItemAttempt,
  onEnter: () => {
    const phaserStore = usePhaserStore();
    const { sceneKey } = storeToRefs(phaserStore);
    const battleDialogStore = useBattleDialogStore();
    const { showMessages } = battleDialogStore;
    const monsterPartySceneStore = useMonsterPartySceneStore();
    const { activeMonster } = storeToRefs(monsterPartySceneStore);
    const itemStore = useItemStore();
    const { onUnuseItemComplete, onUseItemComplete } = storeToRefs(itemStore);
    const { launchScene, removeScene } = usePreviousScene(sceneKey.value);

    onUnuseItemComplete.value = () => {
      battleStateMachine.setState(StateName.PlayerInput);
    };
    onUseItemComplete.value = (item, sceneKey) => {
      const { switchToPreviousScene } = usePreviousScene(sceneKey);
      // We assume here that you can only use an item in a separate scene
      // other than inventory, and that once you've used an item in battle
      // you cannot use another item, so we remove the inventory scene
      removeScene(SceneKey.Inventory);
      switchToPreviousScene();
      showMessages([`You used ${item.name} on ${activeMonster.value.name}.`], () => {
        battleStateMachine.setState(StateName.EnemyInput);
      });
    };
    launchScene(SceneKey.Inventory);
  },
  onExit: () => {
    const itemStore = useItemStore();
    const { onUnuseItemComplete, onUseItemComplete } = storeToRefs(itemStore);

    onUnuseItemComplete.value = undefined;
    onUseItemComplete.value = undefined;
  },
};
