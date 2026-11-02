import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";

import { stopStartedScene } from "#src/services/shared/stopStartedScene";
import { NotInitializedError } from "@esposter/shared";
import { Game } from "phaser";

export const usePhaserStore = defineStore("phaser", () => {
  // The Game is markRaw'd as it enters the ref, so Vue's deep reactive Proxy never wraps it: Phaser's InputManager
  // sorts/finds objects by === identity, and a proxied object differs from the raw one Phaser stored, silently breaking
  // setInteractive priority. The ref is what makes the getter's reads tracked, which a plain variable behind it never was
  const baseGame = ref<Game>();
  // No scene has mounted until the first `switchToScene`, which no key of the consumer's enum can stand for
  const sceneKey = ref<SceneWithPlugins["scene"]["key"]>();
  const parallelSceneKeys = ref<SceneWithPlugins["scene"]["key"][]>([]);
  // The scene keys name scenes of the game they were launched in, so setting a game, or clearing it, starts with none
  const game = computed({
    get: () => baseGame.value,
    set: (newGame) => {
      baseGame.value = newGame && markRaw(newGame);
      sceneKey.value = undefined;
      parallelSceneKeys.value = [];
    },
  });
  const isSameScene = (newSceneKey: SceneWithPlugins["scene"]["key"]) => newSceneKey === sceneKey.value;
  const switchToScene = async (newSceneKey: SceneWithPlugins["scene"]["key"]) => {
    if (isSameScene(newSceneKey)) return;

    const activeGame = game.value;
    if (!activeGame) throw new NotInitializedError(Game.name);

    const oldSceneKey = sceneKey.value;
    sceneKey.value = newSceneKey;
    // Wait for the new scene's vue components to render and their hooks to run before starting it.
    await nextTick();
    // Cleanup old scene resources
    if (oldSceneKey) stopStartedScene(activeGame, oldSceneKey);
    activeGame.scene.start(newSceneKey);
  };

  const prioritizedParallelSceneKeys = ref<SceneWithPlugins["scene"]["key"][]>([]);
  const launchParallelScene = (scene: SceneWithPlugins, targetSceneKey: SceneWithPlugins["scene"]["key"]) => {
    if (parallelSceneKeys.value.includes(targetSceneKey)) return;

    scene.scene.bringToTop(targetSceneKey);
    // Some scenes like the mobile joystick scene are prioritized to always show first
    for (const prioritizedParallelSceneKey of prioritizedParallelSceneKeys.value)
      if (parallelSceneKeys.value.includes(prioritizedParallelSceneKey))
        scene.scene.bringToTop(prioritizedParallelSceneKey);

    scene.scene.launch(targetSceneKey);
    parallelSceneKeys.value.push(targetSceneKey);
  };
  const removeParallelScene = (scene: SceneWithPlugins, targetSceneKey: SceneWithPlugins["scene"]["key"]) => {
    const index = parallelSceneKeys.value.indexOf(targetSceneKey);
    if (index === -1) return;

    parallelSceneKeys.value = parallelSceneKeys.value.toSpliced(index, 1);
    scene.scene.stop(targetSceneKey);
  };

  return {
    game,
    isSameScene,
    launchParallelScene,
    parallelSceneKeys,
    prioritizedParallelSceneKeys,
    removeParallelScene,
    rootSceneKey: sceneKey,
    switchToScene,
  };
});
