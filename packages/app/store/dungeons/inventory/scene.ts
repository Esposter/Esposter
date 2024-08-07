import type { Inventory } from "@/models/dungeons/data/player/Inventory";
import type { Item } from "@/models/dungeons/item/Item";

import { Grid } from "@/models/dungeons/Grid";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { usePlayerStore } from "@/store/dungeons/player";

export const useInventorySceneStore = defineStore("dungeons/inventory/scene", () => {
  const playerStore = usePlayerStore();
  const { player } = storeToRefs(playerStore);
  const inventory = computed({
    get: () => player.value.inventory,
    set: (newInventory) => {
      player.value.inventory = newInventory;
    },
  });

  const createItemOptionGrid = (
    newInventory: Inventory,
  ): Grid<Item | PlayerSpecialInput.Cancel, (Item | PlayerSpecialInput.Cancel)[][]> =>
    new Grid([...newInventory.map((item) => [item]), [PlayerSpecialInput.Cancel]], true);
  const itemOptionGrid = ref(createItemOptionGrid(inventory.value));

  watch(
    inventory,
    (newInventory) => {
      itemOptionGrid.value = createItemOptionGrid(newInventory);
    },
    { deep: true },
  );

  return {
    inventory,
    itemOptionGrid,
  };
});
