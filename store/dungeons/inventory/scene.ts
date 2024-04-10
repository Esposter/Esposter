import { Grid } from "@/models/dungeons/Grid";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import type { Item } from "@/models/dungeons/item/Item";
import { useGameStore } from "@/store/dungeons/game";

export const useInventorySceneStore = defineStore("dungeons/inventory/scene", () => {
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

  return {
    inventory,
    itemOptionGrid,
  };
});
