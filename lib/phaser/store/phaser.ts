import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { type SceneKey } from "@/models/dungeons/keys/SceneKey";
import { type SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { type Game } from "phaser";

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
      phaserEventEmitter.emit(`${BEFORE_DESTROY_SCENE_EVENT_KEY}${oldSceneKey}`);
      game.value.scene.sleep(oldSceneKey);
    }

    sceneKey.value = newSceneKey;
    game.value.scene.start(newSceneKey);
  };
  return {
    game,
    scene,
    sceneKey: exposedSceneKey,
    isSameScene,
    switchToScene,
  };
});
