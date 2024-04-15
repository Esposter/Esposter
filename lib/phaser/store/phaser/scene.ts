import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const useSceneStore = defineStore("phaser/scene", () => {
  const shutdownListeners = ref<((scene: SceneWithPlugins) => void)[]>([]);
  return { shutdownListeners };
});
