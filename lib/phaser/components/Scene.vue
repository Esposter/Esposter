<script setup lang="ts">
import { useInjectGame } from "@/lib/phaser/composables/useInjectGame";
import { Lifecycle } from "@/lib/phaser/models/lifecycle/Lifecycle";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useCameraStore } from "@/lib/phaser/store/phaser/camera";
import { useInputStore } from "@/lib/phaser/store/phaser/input";
import { ExternalSceneStore } from "@/lib/phaser/store/phaser/scene";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import { getScene } from "@/lib/phaser/util/getScene";
import type { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { Cameras, Scenes } from "phaser";

interface SceneProps {
  sceneKey: SceneKey;
  autoStart?: true;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const { sceneKey, autoStart } = defineProps<SceneProps>();
const emit = defineEmits<{
  init: [SceneWithPlugins];
  preload: [SceneWithPlugins];
  create: [SceneWithPlugins];
  update: [SceneWithPlugins, ...Parameters<SceneWithPlugins["update"]>];
  shutdown: [SceneWithPlugins];
}>();
const game = useInjectGame();
const phaserStore = usePhaserStore();
const { switchToScene } = phaserStore;
const cameraStore = useCameraStore();
const { isFading } = storeToRefs(cameraStore);
const inputStore = useInputStore();
const { isActive: isInputActive } = storeToRefs(inputStore);
let newScene: SceneWithPlugins | null = null;
const NewScene = class extends SceneWithPlugins {
  init(this: SceneWithPlugins) {
    emit("init", this);

    const newScene = getScene(game, sceneKey);
    const initListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Init];
    for (const initListener of initListenersMap[sceneKey]) initListener(newScene);
    initListenersMap[sceneKey] = [];
  }

  preload(this: SceneWithPlugins) {
    emit("preload", this);

    const newScene = getScene(game, sceneKey);
    const preloadListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Preload];
    for (const preloadListener of preloadListenersMap[sceneKey]) preloadListener(newScene);
    preloadListenersMap[sceneKey] = [];
  }

  create(this: SceneWithPlugins) {
    emit("create", this);
    if (!isInputActive.value) isInputActive.value = true;

    const newScene = getScene(game, sceneKey);
    newScene.cameras.main.once(Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
      isFading.value = false;
    });
    newScene.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      isFading.value = false;
    });

    const createListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Create];
    for (const createListener of createListenersMap[sceneKey]) createListener(newScene);
    createListenersMap[sceneKey] = [];
  }

  update(this: SceneWithPlugins, ...args: Parameters<SceneWithPlugins["update"]>) {
    emit("update", this, ...args);

    const newScene = getScene(game, sceneKey);
    const updateListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Update];
    for (const updateListener of updateListenersMap[sceneKey]) updateListener(newScene);
    updateListenersMap[sceneKey] = [];
  }
};

const shutdownListener = () => {
  const newScene = getScene(game, sceneKey);
  const shutdownListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Shutdown];
  for (const shutdownListener of shutdownListenersMap[sceneKey]) shutdownListener(newScene);
  shutdownListenersMap[sceneKey] = [];
  emit("shutdown", newScene);
};

onMounted(() => {
  newScene = game.scene.add(sceneKey, NewScene) as SceneWithPlugins;
  newScene.events.on(Scenes.Events.SHUTDOWN, shutdownListener);

  if (autoStart) switchToScene(sceneKey);
});

onUnmounted(() => {
  const newScene = getScene(game, sceneKey);
  newScene.events.off(Scenes.Events.SHUTDOWN, shutdownListener);
  game.scene.remove(sceneKey);
});

provide(InjectionKeyMap.SceneKey, sceneKey);
</script>

<template>
  <slot />
</template>
