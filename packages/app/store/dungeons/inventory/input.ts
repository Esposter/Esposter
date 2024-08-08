import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import type { Direction } from "grid-engine";

import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { isPlayerSpecialInput } from "@/services/dungeons/UI/input/isPlayerSpecialInput";
import { phaserEventEmitter } from "@/services/phaser/events";
import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";
import { exhaustiveGuard } from "@esposter/shared";

export const useInventoryInputStore = defineStore("dungeons/inventory/input", () => {
  const inventorySceneStore = useInventorySceneStore();
  const { itemOptionGrid } = storeToRefs(inventorySceneStore);
  const { launchScene, switchToPreviousScene } = usePreviousScene(SceneKey.Inventory);

  const onPlayerInput = (scene: SceneWithPlugins, justDownInput: PlayerInput) => {
    if (isPlayerSpecialInput(justDownInput)) onPlayerSpecialInput(scene, justDownInput);
    else onPlayerDirectionInput(justDownInput);
  };

  const onPlayerSpecialInput = (scene: SceneWithPlugins, playerSpecialInput: PlayerSpecialInput) => {
    switch (playerSpecialInput) {
      case PlayerSpecialInput.Cancel:
        onCancel(scene);
        return;
      case PlayerSpecialInput.Confirm:
        if (itemOptionGrid.value.value === PlayerSpecialInput.Cancel) onCancel(scene);
        else launchScene(scene, SceneKey.MonsterParty);
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

  const onCancel = (scene: SceneWithPlugins) => {
    switchToPreviousScene(scene);
    phaserEventEmitter.emit("unuseItem");
  };

  return {
    onPlayerInput,
  };
});
