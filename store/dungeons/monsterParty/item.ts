import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";

export const useItemStore = defineStore("dungeons/monsterParty/item", () => {
  const selectedItemIndex = ref(-1);
  const selectedItem = computed({
    get: () => {
      const inventorySceneStore = useInventorySceneStore();
      const { inventory } = storeToRefs(inventorySceneStore);
      return inventory.value[selectedItemIndex.value];
    },
    set: (newSelectedItem) => {
      if (selectedItemIndex.value === -1) return;
      const inventorySceneStore = useInventorySceneStore();
      const { inventory } = storeToRefs(inventorySceneStore);
      inventory.value[selectedItemIndex.value] = newSelectedItem;
    },
  });
  return {
    selectedItemIndex,
    selectedItem,
  };
});
