import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { Grid } from "@/models/dungeons/Grid";
import type { PlayerInput } from "@/models/dungeons/UI/input/PlayerInput";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import type { Item } from "@/models/dungeons/item/Item";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { isPlayerSpecialInput } from "@/services/dungeons/input/isPlayerSpecialInput";
import { useGameStore } from "@/store/dungeons/game";
import { useItemStore } from "@/store/dungeons/monsterParty/item";
import { exhaustiveGuard } from "@/util/exhaustiveGuard";
import type { Direction } from "grid-engine";

export const useInventorySceneStore = defineStore("dungeons/inventory/scene", () => {
  const phaserStore = usePhaserStore();
  const { sceneKey } = storeToRefs(phaserStore);
  const gameStore = useGameStore();
  const { save } = storeToRefs(gameStore);
  const inventory = computed({
    get: () => save.value.player.inventory,
    set: (newInventory) => {
      save.value.player.inventory = newInventory;
    },
  });
  const itemOptionGrid = ref() as Ref<Grid<Item | PlayerSpecialInput.Cancel, (Item | PlayerSpecialInput.Cancel)[][]>>;

  watch(
    inventory,
    (newInventory) => {
      itemOptionGrid.value = new Grid([...newInventory.map((item) => [item]), [PlayerSpecialInput.Cancel]], true);
    },
    { immediate: true, deep: true },
  );

  const itemStore = useItemStore();
  const { selectedItemIndex, itemUsed, onUnuseItemComplete, onUseItemComplete } = storeToRefs(itemStore);
  const { launchScene, switchToPreviousScene } = usePreviousScene(SceneKey.Inventory);

  const onPlayerInput = (justDownInput: PlayerInput) => {
    if (itemUsed.value) {
      const item = itemUsed.value;
      selectedItemIndex.value = -1;
      // If the player used an item during battle,
      // they are not allowed to use another item again
      if (sceneKey.value === SceneKey.Battle) switchToPreviousScene();
      onUseItemComplete.value?.(item);
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
    inventory,
    itemOptionGrid,
    onPlayerInput,
  };
});
