import { useInjectScene } from "@/lib/phaser/composables/useInjectScene";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useSceneStore } from "@/lib/phaser/store/phaser/scene";
import { validateHook } from "@/lib/phaser/util/validateHook";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const onShutdown = (listener: (scene: SceneWithPlugins) => void, sceneKey?: string) => {
  const phaserStore = usePhaserStore();
  const { game } = storeToRefs(phaserStore);

  validateHook(game.value, onShutdown.name);

  const sceneStore = useSceneStore();
  const { shutdownListenersMap } = storeToRefs(sceneStore);

  if (sceneKey) {
    shutdownListenersMap.value[sceneKey as SceneKey].push(listener);
    return;
  }

  const scene = useInjectScene();
  shutdownListenersMap.value[scene.scene.key as SceneKey].push(listener);
};
