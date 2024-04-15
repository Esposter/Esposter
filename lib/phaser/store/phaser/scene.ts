import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const useSceneStore = defineStore("phaser/scene", () => {
  const stopListeners = ref<((scene: SceneWithPlugins) => void)[]>([]);
  return { stopListeners };
});
