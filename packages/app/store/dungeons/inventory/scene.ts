import { Grid } from "@/models/dungeons/Grid";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import type { Item } from "@/models/dungeons/item/Item";
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
