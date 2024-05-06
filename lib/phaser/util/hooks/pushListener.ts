import { useInjectScene } from "@/lib/phaser/composables/useInjectScene";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { validate } from "@/lib/phaser/util/hooks/validate";
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

  const phaserStore = usePhaserStore();
  const { game } = storeToRefs(phaserStore);
  validate(game.value, pushListener.name);

  const scene = useInjectScene();
  listenersMap.value[scene.scene.key as SceneKey].push(listener);
};
