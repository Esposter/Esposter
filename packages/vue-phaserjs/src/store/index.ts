import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";
import type { Game } from "phaser";

import { useGame } from "@/composables/useGame";

export const usePhaserStore = defineStore("phaser", () => {
  // Use a writable computed, not a ref, to keep the Game object unproxied: ref() would wrap it in
  // Vue's deep reactive Proxy, and Phaser's InputManager sorts/finds objects by === identity — proxied
  // Objects differ from the raw ones Phaser stored, silently breaking setInteractive priority.
  let baseGame: Game | undefined;
  const game = computed({
    get: () => baseGame,
    set: (newGame) => {
      baseGame = newGame;
    },
  });

  const sceneKey = ref<SceneWithPlugins["scene"]["key"]>();
  const rootSceneKey = sceneKey;
  const isSameScene = (newSceneKey: SceneWithPlugins["scene"]["key"]) => newSceneKey === sceneKey.value;
  const switchToScene = async (newSceneKey: SceneWithPlugins["scene"]["key"]) => {
    if (isSameScene(newSceneKey)) return;

    const game = useGame();
    const oldSceneKey = sceneKey.value;
    sceneKey.value = newSceneKey;
    // Wait for the new scene's vue components to render and their hooks to run before starting it.
    await nextTick();
    // Cleanup old scene resources
    if (oldSceneKey && game.scene.isActive(oldSceneKey)) game.scene.stop(oldSceneKey);
    game.scene.start(newSceneKey);
  };

  const parallelSceneKeys = ref<SceneWithPlugins["scene"]["key"][]>([]);
  const prioritizedParallelSceneKeys = ref<SceneWithPlugins["scene"]["key"][]>([]);
  const launchParallelScene = (scene: SceneWithPlugins, sceneKey: SceneWithPlugins["scene"]["key"]) => {
    if (parallelSceneKeys.value.includes(sceneKey)) return;

    scene.scene.bringToTop(sceneKey);
    // Some scenes like the mobile joystick scene are prioritized to always show first
    for (const prioritizedParallelSceneKey of prioritizedParallelSceneKeys.value)
      if (parallelSceneKeys.value.includes(prioritizedParallelSceneKey))
        scene.scene.bringToTop(prioritizedParallelSceneKey);

    scene.scene.launch(sceneKey);
    parallelSceneKeys.value.push(sceneKey);
  };
  const removeParallelScene = (scene: SceneWithPlugins, sceneKey: SceneWithPlugins["scene"]["key"]) => {
    const index = parallelSceneKeys.value.indexOf(sceneKey);
    if (index === -1) return;

    const parallelSceneKey = parallelSceneKeys.value.splice(index, 1)[0];
    scene.scene.stop(parallelSceneKey);
  };

  return {
    game,
    isSameScene,
    launchParallelScene,
    parallelSceneKeys,
    prioritizedParallelSceneKeys,
    removeParallelScene,
    rootSceneKey: rootSceneKey as Ref<SceneWithPlugins["scene"]["key"]>,
    switchToScene,
  };
});
