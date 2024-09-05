import type { Item } from "@/models/dungeons/item/Item";

import { Grid } from "@/models/dungeons/Grid";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";

const ItemOptionGrid = new Grid<Item | PlayerSpecialInput.Cancel, (Item | PlayerSpecialInput.Cancel)[][]>({
  grid: [],
  validate(position) {
    const value = this.getValue(position);
    if (value === PlayerSpecialInput.Cancel) return true;
    return useIsUsableItem(value);
  },
  wrap: true,
});

export const useItemOptionGrid = () => {
  const inventorySceneStore = useInventorySceneStore();
  const { inventory } = storeToRefs(inventorySceneStore);
  ItemOptionGrid.grid = computed(() => [...inventory.value.map((item) => [item]), [PlayerSpecialInput.Cancel]]);
  return ItemOptionGrid;
};
