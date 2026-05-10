import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { Cameras } from "phaser";

export const useCameraStore = defineStore("phaser/camera", () => {
  const isFading = ref(false);
  const fadeIn = (
    scene: SceneWithPlugins,
    ...args: Parameters<InstanceType<(typeof Cameras)["Scene2D"]["Camera"]>["fadeIn"]>
  ) => {
    isFading.value = true;
    scene.cameras.main.fadeIn(...args);
  };
  const fadeOut = (
    scene: SceneWithPlugins,
    ...args: Parameters<InstanceType<(typeof Cameras)["Scene2D"]["Camera"]>["fadeOut"]>
  ) => {
    isFading.value = true;
    scene.cameras.main.fadeOut(...args);
  };
  return {
    fadeIn,
    fadeOut,
    isFading,
  };
});
