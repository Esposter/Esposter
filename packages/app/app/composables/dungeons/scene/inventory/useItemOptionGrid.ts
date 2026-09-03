import type { Item } from "#shared/models/dungeons/item/Item";

import { Grid } from "@/models/dungeons/Grid";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";
import { Direction } from "grid-engine";

const ItemOptionGrid = new Grid<(Item | PlayerSpecialInput.Cancel)[][]>({
  grid: [],
  validate(position) {
    const value = this.getValue(position);
    // A column the row does not reach reads as a hole, which `Grid.validate` has already rejected before this
    // Runs — the guard is what lets the item check take an item rather than an item-or-nothing
    if (!value) return false;
    else if (value === PlayerSpecialInput.Cancel) return true;
    return useIsUsableItem(value);
  },
  wrap: true,
});

export const useItemOptionGrid = createUseGrid(ItemOptionGrid, (grid) => {
  const inventorySceneStore = useInventorySceneStore();
  const { inventory } = storeToRefs(inventorySceneStore);
  grid.grid = computed(() => [...inventory.value.map((item) => [item]), [PlayerSpecialInput.Cancel]]);

  watchDeep(inventory, () => {
    if (unref(grid.validate(grid.position.value))) return;
    // If our inventory has changed and we are no longer on a valid item,
    // Simply move down to the next valid item
    grid.move(Direction.DOWN);
  });
});
