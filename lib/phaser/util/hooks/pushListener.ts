import { useInjectScene } from "@/lib/phaser/composables/useInjectScene";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const pushListener = (
  listenersMap: Ref<Record<SceneKey, ((scene: SceneWithPlugins) => void)[]>>,
  listener: (scene: SceneWithPlugins) => void,
  sceneKey?: string,
) => {
  if (sceneKey) {
    listenersMap.value[sceneKey as SceneKey].push(listener);
    return;
  }

  const scene = useInjectScene();
  listenersMap.value[scene.scene.key as SceneKey].push(listener);
};
