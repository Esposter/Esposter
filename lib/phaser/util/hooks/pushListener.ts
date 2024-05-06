import { useInjectScene } from "@/lib/phaser/composables/useInjectScene";
import type { Lifecycle } from "@/lib/phaser/models/lifecycle/Lifecycle";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ExternalSceneStore } from "@/lib/phaser/store/phaser/scene";
import { validate } from "@/lib/phaser/util/hooks/validate";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const pushListener = (lifecycle: Lifecycle, listener: (scene: SceneWithPlugins) => void, sceneKey?: string) => {
  if (sceneKey) {
    ExternalSceneStore.lifeCycleListenersMap[lifecycle][sceneKey as SceneKey].push(listener);
    return;
  }

  const phaserStore = usePhaserStore();
  const { game } = storeToRefs(phaserStore);
  validate(game.value, pushListener.name);

  const scene = useInjectScene();
  ExternalSceneStore.lifeCycleListenersMap[lifecycle][scene.scene.key as SceneKey].push(listener);
};
