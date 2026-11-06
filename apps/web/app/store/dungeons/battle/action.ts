import type { getAttackStatePriorityMap } from "@/services/dungeons/scene/battle/getAttackStatePriorityMap";

export const useActionStore = defineStore("dungeons/battle/action", () => {
  const attackStatePriorityMap = ref<ReturnType<typeof getAttackStatePriorityMap>>();
  return { attackStatePriorityMap: attackStatePriorityMap as Ref<ReturnType<typeof getAttackStatePriorityMap>> };
});
