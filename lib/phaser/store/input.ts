import type { Controls } from "@/lib/phaser/models/input/Controls";

export const useInputStore = defineStore("phaser/input", () => {
  // We can assume that this will always exist because
  // we will create the controls in the preloader scene
  const controls = ref() as Ref<Controls>;
  const isActive = ref(false);
  return { controls, isActive };
});
