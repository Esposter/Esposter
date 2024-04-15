import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const useSceneStore = defineStore("phaser/scene", () => {
  const shutdownListenersMap = ref(
    Object.values(SceneKey).reduce(
      (acc, curr) => {
        acc[curr] = [];
        return acc;
      },
      {} as Record<SceneKey, ((scene: SceneWithPlugins) => void)[]>,
    ),
  );
  return { shutdownListenersMap };
});
