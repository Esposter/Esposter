import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { Cameras } from "phaser";

import { useInputStore } from "@/store/input";

export const useCameraStore = defineStore("phaser/camera", () => {
  const inputStore = useInputStore();
  const isFading = ref(false);
  const fadeIn = (
    scene: SceneWithPlugins,
    ...args: Parameters<InstanceType<(typeof Cameras)["Scene2D"]["Camera"]>["fadeIn"]>
  ) => {
    isFading.value = true;
    inputStore.isInputActive = false;
    scene.cameras.main.fadeIn(...args);
  };
  const fadeOut = (
    scene: SceneWithPlugins,
    ...args: Parameters<InstanceType<(typeof Cameras)["Scene2D"]["Camera"]>["fadeOut"]>
  ) => {
    isFading.value = true;
    inputStore.isInputActive = false;
    scene.cameras.main.fadeOut(...args);
  };
  return {
    fadeIn,
    fadeOut,
    isFading,
  };
});
