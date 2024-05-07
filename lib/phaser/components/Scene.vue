<script setup lang="ts">
import { useGame } from "@/lib/phaser/composables/useGame";
import { JoystickControls } from "@/lib/phaser/models/input/JoystickControls";
import { KeyboardControls } from "@/lib/phaser/models/input/KeyboardControls";
import { Lifecycle } from "@/lib/phaser/models/lifecycle/Lifecycle";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { useCameraStore } from "@/lib/phaser/store/phaser/camera";
import { useInputStore } from "@/lib/phaser/store/phaser/input";
import { ExternalSceneStore } from "@/lib/phaser/store/phaser/scene";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import { getScene } from "@/lib/phaser/util/getScene";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import isMobile from "is-mobile";
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
const phaserStore = usePhaserStore();
const { isSameScene, switchToScene, launchParallelScene } = phaserStore;
const { parallelSceneKeys } = storeToRefs(phaserStore);
const isActive = computed(() => isSameScene(sceneKey) || parallelSceneKeys.value.includes(sceneKey));
const cameraStore = useCameraStore();
const { isFading } = storeToRefs(cameraStore);
const inputStore = useInputStore();
const { controls, isActive: isInputActive } = storeToRefs(inputStore);
let newScene: SceneWithPlugins | null = null;
const NewScene = class extends SceneWithPlugins {
  init(this: SceneWithPlugins) {
    emit("init", this);
    const initListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Init];
    for (const initListener of initListenersMap[sceneKey]) initListener(this);
    initListenersMap[sceneKey] = [];
  }

  preload(this: SceneWithPlugins) {
    emit("preload", this);
    const preloadListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Preload];
    for (const preloadListener of preloadListenersMap[sceneKey]) preloadListener(this);
    preloadListenersMap[sceneKey] = [];
  }

  create(this: SceneWithPlugins) {
    if (isMobile()) {
      controls.value = new JoystickControls();
      launchParallelScene(this, SceneKey.MobileJoystick);
    } else controls.value = new KeyboardControls(this);

    emit("create", this);
    if (!isInputActive.value) isInputActive.value = true;

    this.cameras.main.once(Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
      isFading.value = false;
    });
    this.cameras.main.once(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      isFading.value = false;
    });

    const createListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Create];
    for (const createListener of createListenersMap[sceneKey]) createListener(this);
    createListenersMap[sceneKey] = [];
  }

  update(this: SceneWithPlugins, ...args: Parameters<SceneWithPlugins["update"]>) {
    emit("update", this, ...args);
    const updateListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Update];
    for (const updateListener of updateListenersMap[sceneKey]) updateListener(this);

    const nextTickListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.NextTick];
    for (const nextTickListener of nextTickListenersMap[sceneKey]) nextTickListener(this);
    nextTickListenersMap[sceneKey] = [];
  }
};

const shutdownListener = () => {
  const updateListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Update];
  updateListenersMap[sceneKey] = [];

  const newScene = getScene(sceneKey);
  const shutdownListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Shutdown];
  for (const shutdownListener of shutdownListenersMap[sceneKey]) shutdownListener(newScene);
  shutdownListenersMap[sceneKey] = [];
  emit("shutdown", newScene);
};

onMounted(() => {
  const game = useGame();
  newScene = game.scene.add(sceneKey, NewScene) as SceneWithPlugins;
  newScene.events.on(Scenes.Events.SHUTDOWN, shutdownListener);
  if (autoStart) switchToScene(sceneKey);
});

onUnmounted(() => {
  const game = useGame();
  const newScene = getScene(sceneKey);
  newScene.events.off(Scenes.Events.SHUTDOWN, shutdownListener);
  game.scene.remove(sceneKey);
});

provide(InjectionKeyMap.SceneKey, sceneKey);
</script>

<template>
  <slot v-if="isActive" />
</template>
