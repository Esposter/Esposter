import type { Controls } from "@/models/dungeons/input/Controls";

export const useControlsStore = defineStore("dungeons/controls", () => {
  // We can assume that this will always exist because
  // we will create the controls in the preloader scene
  const controls = ref() as Ref<Controls>;
  return { controls };
});
