export const useInputStore = defineStore("phaser/input", () => {
  const isInputActive = ref(false);
  return { isInputActive };
});
