import type { Item } from "@/models/dungeons/item/Item";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";

export const useItemStore = defineStore("dungeons/inventory/item", () => {
  const inventorySceneStore = useInventorySceneStore();
  const { inventory } = storeToRefs(inventorySceneStore);
  const selectedItemIndex = ref(-1);
  const selectedItem = computed({
    get: () => inventory.value[selectedItemIndex.value],
    set: (newSelectedItem) => {
      if (selectedItemIndex.value === -1) return;
      inventory.value[selectedItemIndex.value] = newSelectedItem;
    },
  });
  const itemUsed = ref<Item>();
  const onUnuseItemComplete = ref<() => void>();
  const onUseItemComplete = ref<(item: Item, sceneKey: SceneKey) => void>();
  return {
    selectedItemIndex,
    selectedItem,
    itemUsed,
    onUnuseItemComplete,
    onUseItemComplete,
  };
});
