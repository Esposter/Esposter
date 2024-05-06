import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { NotInitializedError } from "@/models/error/NotInitializedError";
import type { Game } from "phaser";

export const usePhaserStore = defineStore("phaser", () => {
  // @NOTE: A very weird bug will occur here with setInteractive input priority
  // if the game is a ref >:C
  let baseGame: Game | null = null;
  const game = computed({
    get: () => baseGame,
    set: (newGame: Game | null) => {
      baseGame = newGame;
    },
  });

  const sceneKey = ref<SceneKey | null>(null);
  // When we access the scene key from outside components, it should already be initialized
  const exposedSceneKey = sceneKey as Ref<SceneKey>;
  const isSameScene = (newSceneKey: SceneKey) => newSceneKey === sceneKey.value;
  const switchToScene = (newSceneKey: SceneKey) => {
    if (!game.value) throw new NotInitializedError(InjectionKeyMap.Game.description ?? "");
    else if (isSameScene(newSceneKey)) return;

    // Cleanup old scene resources
    const oldSceneKey = sceneKey.value;
    if (oldSceneKey && game.value.scene.isActive(oldSceneKey)) game.value.scene.stop(oldSceneKey);

    sceneKey.value = newSceneKey;
    game.value.scene.start(newSceneKey);
  };

  const parallelSceneKeys = ref<SceneKey[]>([]);
  const launchParallelScene = (scene: SceneWithPlugins, sceneKey: SceneKey) => {
    if (parallelSceneKeys.value.includes(sceneKey)) return;

    scene.scene.bringToTop(sceneKey);
    // Mobile controls should always be the first to render
    if (parallelSceneKeys.value.includes(SceneKey.MobileJoystick)) scene.scene.bringToTop(SceneKey.MobileJoystick);
    scene.scene.launch(sceneKey);
    parallelSceneKeys.value.push(sceneKey);
  };
  const removeParallelScene = (scene: SceneWithPlugins, sceneKey: SceneKey) => {
    const index = parallelSceneKeys.value.indexOf(sceneKey);
    if (index === -1) return;

    const parallelSceneKey = parallelSceneKeys.value.splice(index, 1)[0];
    scene.scene.stop(parallelSceneKey);
  };

  return {
    game,
    sceneKey: exposedSceneKey,
    isSameScene,
    switchToScene,
    parallelSceneKeys,
    launchParallelScene,
    removeParallelScene,
  };
});
