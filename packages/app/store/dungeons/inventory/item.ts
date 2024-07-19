import { createSelectedItemData } from "@/services/shared/createSelectedItemData";
import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";

export const useItemStore = defineStore("dungeons/inventory/item", () => {
  const inventorySceneStore = useInventorySceneStore();
  const { inventory } = storeToRefs(inventorySceneStore);
  return createSelectedItemData(inventory);
});
