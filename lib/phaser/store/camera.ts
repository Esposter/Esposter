import { useInputStore } from "@/lib/phaser/store/input";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import type { Cameras } from "phaser";

export const useCameraStore = defineStore("phaser/camera", () => {
  const inputStore = useInputStore();
  const { isActive } = storeToRefs(inputStore);
  const isFading = ref(false);
  const fadeIn = (
    scene: SceneWithPlugins,
    ...args: Parameters<InstanceType<(typeof Cameras)["Scene2D"]["Camera"]>["fadeIn"]>
  ) => {
    isFading.value = true;
    isActive.value = false;
    scene.cameras.main.fadeIn(...args);
  };
  const fadeOut = (
    scene: SceneWithPlugins,
    ...args: Parameters<InstanceType<(typeof Cameras)["Scene2D"]["Camera"]>["fadeOut"]>
  ) => {
    isFading.value = true;
    isActive.value = false;
    scene.cameras.main.fadeOut(...args);
  };
  return {
    isFading,
    fadeIn,
    fadeOut,
  };
});
