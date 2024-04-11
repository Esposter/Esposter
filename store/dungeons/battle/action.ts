export const useActionStore = defineStore("dungeons/battle/action", () => {
  const hasPlayerAttacked = ref(false);
  const hasEnemyAttacked = ref(false);
  return {
    hasPlayerAttacked,
    hasEnemyAttacked,
  };
});
