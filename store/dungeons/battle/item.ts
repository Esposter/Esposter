import type { Item } from "@/models/dungeons/item/Item";

export const useItemStore = defineStore("dungeons/battle/item", () => {
  const itemUsed = ref<Item>();
  return {
    itemUsed,
  };
});
