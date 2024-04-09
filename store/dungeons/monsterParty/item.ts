import type { Item } from "@/models/dungeons/item/Item";
import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";

export const useMonsterPartyItemStore = defineStore("dungeons/monsterParty/item", () => {
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
  const onUnusedItemComplete = ref<() => void>();
  const onUseItemComplete = ref<(item: Item) => void>();
  return {
    selectedItemIndex,
    selectedItem,
    onUnusedItemComplete,
    onUseItemComplete,
  };
});
