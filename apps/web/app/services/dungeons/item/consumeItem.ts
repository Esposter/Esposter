import type { Item } from "#shared/models/dungeons/item/Item";

import { useInventorySceneStore } from "@/store/dungeons/inventory/scene";

// Spending the item is the same act whichever resolver handled it, so it is the caller's step rather than
// Something a resolver can forget to do
export const consumeItem = (item: Ref<Item>) => {
  const inventorySceneStore = useInventorySceneStore();
  const { inventory } = storeToRefs(inventorySceneStore);

  item.value.quantity--;
  if (item.value.quantity > 0) return;

  const index = inventory.value.findIndex(({ id }) => id === item.value.id);
  if (index === -1) return;
  inventory.value = inventory.value.toSpliced(index, 1);
};
