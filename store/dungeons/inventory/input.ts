import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { isPlayerSpecialInput } from "@/services/dungeons/input/isPlayerSpecialInput";
import { useItemStore } from "@/store/dungeons/inventory/item";
import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import type { Direction } from "grid-engine";

export const useInputStore = defineStore("dungeons/inventory/input", () => {
  const inventorySceneStore = useInventorySceneStore();
  const { itemOptionGrid } = storeToRefs(inventorySceneStore);
  const itemStore = useItemStore();
  const { selectedItemIndex, onUnuseItemComplete } = storeToRefs(itemStore);
  const { launchScene, switchToPreviousScene } = usePreviousScene(SceneKey.Inventory);

  const onPlayerInput = (justDownInput: PlayerInput) => {
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
