export const useActionStore = defineStore("dungeons/battle/action", () => {
  const attackStatePriorityMap = ref<ReturnType<typeof useAttackStatePriorityMap>>();
  return {
    attackStatePriorityMap: attackStatePriorityMap as Ref<ReturnType<typeof useAttackStatePriorityMap>>,
  };
});
