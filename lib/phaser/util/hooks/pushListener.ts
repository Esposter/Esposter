import { useInjectScene } from "@/lib/phaser/composables/useInjectScene";
import type { ListenersMap } from "@/lib/phaser/models/lifecycle/ListenersMap";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { validate } from "@/lib/phaser/util/hooks/validate";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const pushListener = (
  listenersMap: ListenersMap,
  listener: (scene: SceneWithPlugins) => void,
  sceneKey?: string,
) => {
  if (sceneKey) {
    listenersMap[sceneKey as SceneKey].push(listener);
    return;
  }

  const phaserStore = usePhaserStore();
  const { game } = storeToRefs(phaserStore);
  validate(game.value, pushListener.name);

  const scene = useInjectScene();
  listenersMap[scene.scene.key as SceneKey].push(listener);
};
