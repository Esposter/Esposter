import type { Item } from "@/models/dungeons/item/Item";

import { Grid } from "@/models/dungeons/Grid";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";
import { Direction } from "grid-engine";

const ItemOptionGrid = new Grid<Item | PlayerSpecialInput.Cancel, (Item | PlayerSpecialInput.Cancel)[][]>({
  grid: [],
  validate(position) {
    const value = this.getValue(position);
    if (value === PlayerSpecialInput.Cancel) return true;
    return useIsUsableItem(value);
  },
  wrap: true,
});

let isInitialized = false;

export const useItemOptionGrid = () => {
  const inventorySceneStore = useInventorySceneStore();
  const { inventory } = storeToRefs(inventorySceneStore);

  if (!isInitialized) {
    ItemOptionGrid.grid = computed(() => [...inventory.value.map((item) => [item]), [PlayerSpecialInput.Cancel]]);

    watch(
      inventory,
      () => {
        if (unref(ItemOptionGrid.validate(ItemOptionGrid.position.value))) return;
        // If our inventory has changed and we are no longer on a valid item,
        // simply move down to the next valid item
        ItemOptionGrid.move(Direction.DOWN);
      },
      { deep: true },
    );

    isInitialized = true;
  }

  return ItemOptionGrid;
};
