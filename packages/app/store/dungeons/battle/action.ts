export const useActionStore = defineStore("dungeons/battle/action", () => {
  const attackStatePriorityMap = ref() as Ref<ReturnType<typeof useAttackStatePriorityMap>>;
  return {
    attackStatePriorityMap,
  };
});
