import type { Item } from "#shared/models/dungeons/item/Item";

import { Grid } from "#src/models/dungeons/Grid";
import { PlayerSpecialInput } from "#src/models/dungeons/UI/input/PlayerSpecialInput";
import { checkIsUsableItem } from "#src/services/dungeons/scene/inventory/checkIsUsableItem";
import { usePlayerStore } from "#src/store/dungeons/player";
import { useSceneStore } from "#src/store/dungeons/scene";
import { Direction } from "grid-engine";

export const useInventorySceneStore = defineStore("dungeons/inventory/scene", () => {
  const playerStore = usePlayerStore();
  const sceneStore = useSceneStore();
  const inventory = computed({
    get: () => playerStore.player.inventory,
    set: (newInventory) => {
      playerStore.player.inventory = newInventory;
    },
  });
  // Held by the store rather than at module scope, so each Pinia instance starts with its own cursor
  const itemOptionGrid = markRaw(
    new Grid<(Item | typeof PlayerSpecialInput.Cancel)[][]>({
      grid: computed(() => [...inventory.value.map((item) => [item]), [PlayerSpecialInput.Cancel]]),
      isWrapping: true,
      validate(position) {
        const value = this.getValue(position);
        // A column the row does not reach reads as a hole, which `Grid.validate` has already rejected before this
        // Runs — the guard is what lets the item check take an item rather than an item-or-nothing
        if (!value) return false;
        else if (value === PlayerSpecialInput.Cancel) return true;
        else return checkIsUsableItem(value, sceneStore.previousSceneKey);
      },
    }),
  );
  // The store lives as long as the app, so this watch needs no scope of its own. An inventory that shrank under the
  // Cursor leaves it on a hole, so it moves down to the next valid item
  watchDeep(inventory, () => {
    if (unref(itemOptionGrid.validate(itemOptionGrid.position.value))) return;
    itemOptionGrid.move(Direction.DOWN);
  });
  return { inventory, itemOptionGrid };
});
