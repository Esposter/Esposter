import type { Game } from "phaser";
import type { SceneWithPlugins } from "vue-phaser";

import { useGame } from "@/composables/useGame";
import { SceneKey } from "@/models/keys/SceneKey";

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

  const sceneKey = ref<null | SceneKey>(null);
  // When we access the root scene key from outside components, it should already be initialized
  const rootSceneKey = sceneKey as Ref<SceneKey>;
  const isSameScene = (newSceneKey: SceneKey) => newSceneKey === sceneKey.value;
  const switchToScene = async (newSceneKey: SceneKey) => {
    if (isSameScene(newSceneKey)) return;

    const game = useGame();
    const oldSceneKey = sceneKey.value;
    sceneKey.value = newSceneKey;
    // We need to wait until all the vue components for the new scene have been rendered
    // and the hooks have all been executed before we can tell phaser to start the new scene
    await nextTick();
    // Cleanup old scene resources
    if (oldSceneKey && game.scene.isActive(oldSceneKey)) game.scene.stop(oldSceneKey);
    game.scene.start(newSceneKey);
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
    isSameScene,
    launchParallelScene,
    parallelSceneKeys,
    removeParallelScene,
    rootSceneKey,
    switchToScene,
  };
});
