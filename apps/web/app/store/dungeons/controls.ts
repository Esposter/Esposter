import type { Controls } from "#src/models/dungeons/input/Controls";

export const useControlsStore = defineStore("dungeons/controls", () => {
  const controls = ref<Controls>() as Ref<Controls>;
  return { controls };
});
