import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useSceneStore } from "@/lib/phaser/store/phaser/scene";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { NotInitializedError } from "@/models/error/NotInitializedError";
import { GameObjectType } from "@/models/error/dungeons/GameObjectType";

export const onShutdown = (listener: (scene: SceneWithPlugins) => void) => {
  const phaserStore = usePhaserStore();
  const { game } = storeToRefs(phaserStore);

  if (!game.value) throw new NotInitializedError(GameObjectType.Game);
  else if (game.value.scene.scenes.length !== Object.keys(SceneKey).length)
    throw new Error(
      `
      onShutdown has been incorrectly called when all the scenes in the game have not been initialized yet.
      If you have called onShutdown on a root scene component that renders <Scene /> from the vue-phaser library,
      please use the @shutdown event emitter instead.`,
    );

  const sceneStore = useSceneStore();
  const { shutdownListeners } = storeToRefs(sceneStore);
  shutdownListeners.value.push(listener);
};
