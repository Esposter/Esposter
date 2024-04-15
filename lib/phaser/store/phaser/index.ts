import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { BEFORE_STOP_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
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
  // We will create the scene in the game and ensure that the scene will always exist
  // for the child components by using v-if for the scene value
  const scene = computed(() => {
    if (!game.value) return;
    if (!sceneKey.value) return;
    return game.value.scene.getScene<SceneWithPlugins>(sceneKey.value);
  }) as ComputedRef<SceneWithPlugins>;
  const isSameScene = (newSceneKey: SceneKey) => newSceneKey === sceneKey.value;
  const switchToScene = (newSceneKey: SceneKey) => {
    if (!game.value || isSameScene(newSceneKey)) return;
    // Cleanup old scene resources
    const oldSceneKey = sceneKey.value;
    if (oldSceneKey) {
      phaserEventEmitter.emit(`${BEFORE_STOP_SCENE_EVENT_KEY}${oldSceneKey}`);
      if (scene.value.scene.isActive()) game.value.scene.stop(oldSceneKey);
    }

    sceneKey.value = newSceneKey;
    game.value.scene.start(newSceneKey);
  };

  const parallelSceneKeys = ref<SceneKey[]>([]);
  const launchParallelScene = (sceneKey: SceneKey) => {
    if (parallelSceneKeys.value.includes(sceneKey)) return;
    scene.value.scene.bringToTop(sceneKey);
    // Mobile controls should always be the first to render
    if (parallelSceneKeys.value.includes(SceneKey.MobileJoystick))
      scene.value.scene.bringToTop(SceneKey.MobileJoystick);
    scene.value.scene.launch(sceneKey);
    parallelSceneKeys.value.push(sceneKey);
  };
  const removeParallelScene = (sceneKey: SceneKey) => {
    const index = parallelSceneKeys.value.indexOf(sceneKey);
    if (index === -1) return;

    const parallelSceneKey = parallelSceneKeys.value.splice(index, 1)[0];
    scene.value.scene.stop(parallelSceneKey);
  };

  return {
    game,
    sceneKey: exposedSceneKey,
    scene,
    isSameScene,
    switchToScene,
    parallelSceneKeys,
    launchParallelScene,
    removeParallelScene,
  };
});
