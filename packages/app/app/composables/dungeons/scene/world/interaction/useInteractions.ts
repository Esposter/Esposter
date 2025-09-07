import type { SceneWithPlugins } from "vue-phaserjs";

export const useInteractions = async (scene: SceneWithPlugins) =>
  (await useInteractWithNpc(scene)) || (await useInteractWithObject(scene));
