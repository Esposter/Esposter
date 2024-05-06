import { getScene } from "@/lib/phaser/util/getScene";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { InvalidOperationError } from "@/models/error/InvalidOperationError";
import { Operation } from "@/models/shared/Operation";
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
    if (!game.value || isSameScene(newSceneKey)) return;
    // Cleanup old scene resources
    const oldSceneKey = sceneKey.value;
    if (oldSceneKey && game.value.scene.isActive(oldSceneKey)) game.value.scene.stop(oldSceneKey);

    sceneKey.value = newSceneKey;
    game.value.scene.start(newSceneKey);
  };

  const parallelSceneKeys = ref<SceneKey[]>([]);
  const launchParallelScene = (sceneKey: SceneKey) => {
    if (!game.value) throw new InvalidOperationError(Operation.Create, launchParallelScene.name, sceneKey);
    else if (parallelSceneKeys.value.includes(sceneKey)) return;

    const scene = getScene(game.value, sceneKey);
    scene.scene.bringToTop(sceneKey);
    // Mobile controls should always be the first to render
    if (parallelSceneKeys.value.includes(SceneKey.MobileJoystick)) scene.scene.bringToTop(SceneKey.MobileJoystick);
    scene.scene.launch(sceneKey);
    parallelSceneKeys.value.push(sceneKey);
  };
  const removeParallelScene = (sceneKey: SceneKey) => {
    if (!game.value) throw new InvalidOperationError(Operation.Delete, removeParallelScene.name, sceneKey);

    const index = parallelSceneKeys.value.indexOf(sceneKey);
    if (index === -1) return;

    const parallelSceneKey = parallelSceneKeys.value.splice(index, 1)[0];
    const scene = getScene(game.value, sceneKey);
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
