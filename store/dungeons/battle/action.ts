import type { Item } from "@/models/dungeons/item/Item";

export const useActionStore = defineStore("dungeons/battle/action", () => {
  const itemUsed = ref<Item>();
  const isFleeAttempted = ref(false);
  const hasPlayerAttacked = ref(false);
  const hasEnemyAttacked = ref(false);
  return {
    itemUsed,
    isFleeAttempted,
    hasPlayerAttacked,
    hasEnemyAttacked,
  };
});
