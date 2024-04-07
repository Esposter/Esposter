export const useInputStore = defineStore("phaser/input", () => {
  const isActive = ref(false);
  return { isActive };
});
