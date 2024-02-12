import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { type SceneKey } from "@/models/dungeons/keys/SceneKey";
import { type SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { type Game } from "phaser";

export const usePhaserStore = defineStore("phaser", () => {
  const game = ref<Game | null>(null);
  // All our scene transitions will be handled by watching the current scene key
  const sceneKey = ref<string | null>(null);
  // We will create the scene in the game and ensure that the scene will always exist
  // for the child components by using v-if for the scene value
  const scene = computed(() => {
    if (!game.value) return;
    if (!sceneKey.value) return;
    return game.value.scene.getScene<SceneWithPlugins>(sceneKey.value);
  }) as ComputedRef<SceneWithPlugins>;
  const isSameScene = (newSceneKey: string) => newSceneKey === sceneKey.value;
  const switchToScene = (newSceneKey: string) => {
    if (!game.value || isSameScene(newSceneKey)) return;

    phaserEventEmitter.emit(`${DESTROY_SCENE_EVENT_KEY}${sceneKey.value as SceneKey}`);
    sceneKey.value = newSceneKey;
    game.value.scene.start(newSceneKey);
  };
  return {
    game,
    scene,
    isSameScene,
    switchToScene,
  };
});
