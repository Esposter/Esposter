import { usePhaserStore } from "@/lib/phaser/store/phaser";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { isPlayerSpecialInput } from "@/services/dungeons/input/isPlayerSpecialInput";
import { useItemStore as useInventoryItemStore } from "@/store/dungeons/inventory/item";
import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";
import { useItemStore as useMonsterPartyItemStore } from "@/store/dungeons/monsterParty/item";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import type { Direction } from "grid-engine";

export const useInputStore = defineStore("dungeons/inventory/input", () => {
  const phaserStore = usePhaserStore();
  const { sceneKey } = storeToRefs(phaserStore);
  const inventorySceneStore = useInventorySceneStore();
  const { itemOptionGrid } = storeToRefs(inventorySceneStore);
  const monsterPartyItemStore = useMonsterPartyItemStore();
  const { selectedItemIndex } = storeToRefs(monsterPartyItemStore);
  const inventoryItemStore = useInventoryItemStore();
  const { itemUsed, onUnuseItemComplete, onUseItemComplete } = storeToRefs(inventoryItemStore);
  const { launchScene, switchToPreviousScene } = usePreviousScene(SceneKey.Inventory);

  const onPlayerInput = (justDownInput: PlayerInput) => {
    if (itemUsed.value) {
      const item = itemUsed.value;
      selectedItemIndex.value = -1;
      // If the player used an item during battle, they are not allowed to use another item again
      // so we immediately switch out of our inventory scene
      if (sceneKey.value === SceneKey.Battle) {
        switchToPreviousScene();
        onUseItemComplete.value?.(item);
      } else itemUsed.value = undefined;
      return;
    }

    if (isPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(justDownInput);
    else onPlayerDirectionInput(justDownInput);
  };

  const onPlayerSpecialInput = (playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Confirm:
        if (itemOptionGrid.value.value === PlayerSpecialInput.Cancel) onCancel();
        else {
          selectedItemIndex.value = itemOptionGrid.value.index;
          launchScene(SceneKey.MonsterParty);
        }
        return;
      case PlayerSpecialInput.Cancel:
        onCancel();
        return;
      case PlayerSpecialInput.Enter:
        return;
      default:
        exhaustiveGuard(playerSpecialInput);
    }
  };

  const onPlayerDirectionInput = (direction: Direction) => {
    itemOptionGrid.value.move(direction);
  };

  const onCancel = () => {
    switchToPreviousScene();
    onUnuseItemComplete.value?.();
  };

  return {
    onPlayerInput,
  };
});
