import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useSceneStore } from "@/lib/phaser/store/phaser/scene";
import { pushListener } from "@/lib/phaser/util/hooks/pushListener";
import { validate } from "@/lib/phaser/util/hooks/validate";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";

export const onShutdown = (listener: (scene: SceneWithPlugins) => void, sceneKey?: string) => {
  const phaserStore = usePhaserStore();
  const { game } = storeToRefs(phaserStore);
  validate(game.value, onShutdown.name);

  const sceneStore = useSceneStore();
  const { shutdownListenersMap } = storeToRefs(sceneStore);
  pushListener(shutdownListenersMap, listener, sceneKey);
};
