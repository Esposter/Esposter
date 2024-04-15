import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useSceneStore } from "@/lib/phaser/store/phaser/scene";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { NotInitializedError } from "@/models/error/NotInitializedError";
import { GameObjectType } from "@/models/error/dungeons/GameObjectType";

export const onShutdown = (listener: (scene: SceneWithPlugins) => void, sceneKey?: string) => {
  const phaserStore = usePhaserStore();
  const { game, sceneKey: defaultSceneKey } = storeToRefs(phaserStore);

  if (!game.value) throw new NotInitializedError(GameObjectType.Game);
  else if (game.value.scene.scenes.length !== Object.keys(SceneKey).length)
    throw new Error(
      `
      onShutdown has been incorrectly called when all the scenes in the game have not been initialized yet.
      If you have called onShutdown in a root scene component that renders <Scene /> from the vue-phaser library,
      please call onShutdown in the event emitters provided by <Scene /> instead and pass in the scene key.`,
    );

  const sceneStore = useSceneStore();
  const { shutdownListenersMap } = storeToRefs(sceneStore);
  shutdownListenersMap.value[(sceneKey as SceneKey) ?? defaultSceneKey.value].push(listener);
};
