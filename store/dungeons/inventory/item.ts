import type { Item } from "@/models/dungeons/item/Item";

export const useItemStore = defineStore("dungeons/inventory/item", () => {
  const itemUsed = ref<Item>();
  const onUnuseItemComplete = ref<() => void>();
  const onUseItemComplete = ref<(item: Item) => void>();
  return {
    itemUsed,
    onUnuseItemComplete,
    onUseItemComplete,
  };
});
