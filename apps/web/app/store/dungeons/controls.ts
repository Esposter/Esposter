import type { Controls } from "#src/models/dungeons/input/Controls";

import { NotInitializedError } from "@esposter/shared";

export const useControlsStore = defineStore("dungeons/controls", () => {
  // The controls are made when the scene is created, so a read before that is an error rather than an undefined
  const controlsValue = ref<Controls>();
  const controls = computed({
    get: () => {
      if (!controlsValue.value) throw new NotInitializedError("Controls");
      return controlsValue.value;
    },
    set: (newControls) => {
      controlsValue.value = newControls;
    },
  });
  return { controls };
});
