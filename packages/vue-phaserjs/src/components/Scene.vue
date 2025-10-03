<script setup lang="ts">
import type { SceneProps } from "@/models/scene/SceneProps";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

import { useGame } from "@/composables/useGame";
import { Lifecycle } from "@/models/lifecycle/Lifecycle";
import { usePhaserStore } from "@/store";
import { useCameraStore } from "@/store/camera";
import { useInputStore } from "@/store/input";
import { ExternalSceneStore } from "@/store/scene";
import { getScene } from "@/util/getScene";
import { resetLifecycleListeners } from "@/util/hooks/resetLifecycleListeners";
import { runLifecycleListeners } from "@/util/hooks/runLifecycleListeners";
import { InjectionKeyMap } from "@/util/InjectionKeyMap";
import { Cameras, Scene, Scenes } from "phaser";

defineSlots<{ default: () => VNode }>();
const { autoStart, sceneKey } = defineProps<SceneProps>();
const emit = defineEmits<{
  create: [SceneWithPlugins];
  init: [SceneWithPlugins];
  preload: [SceneWithPlugins];
  shutdown: [SceneWithPlugins];
  update: [SceneWithPlugins, ...Parameters<SceneWithPlugins["update"]>];
}>();
const phaserStore = usePhaserStore();
const { isSameScene, switchToScene } = phaserStore;
const cameraStore = useCameraStore();
const { isFading } = storeToRefs(cameraStore);
const inputStore = useInputStore();
const { isInputActive } = storeToRefs(inputStore);
const { parallelSceneKeys } = storeToRefs(phaserStore);
const isActive = computed(() => isSameScene(sceneKey) || parallelSceneKeys.value.includes(sceneKey));
const NewScene = class extends Scene {
  create(this: SceneWithPlugins) {
    emit("create", this);
    runLifecycleListeners(this, Lifecycle.Create);
    this.cameras.main.on(Cameras.Scene2D.Events.FADE_IN_COMPLETE, fadeInCompleteListener);
    this.cameras.main.on(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, fadeOutCompleteListener);
    if (!isInputActive.value) isInputActive.value = true;
  }

  init(this: SceneWithPlugins) {
    emit("init", this);
    runLifecycleListeners(this, Lifecycle.Init);
  }

  preload(this: SceneWithPlugins) {
    emit("preload", this);
    runLifecycleListeners(this, Lifecycle.Preload);
  }

  override update(this: SceneWithPlugins, ...args: Parameters<SceneWithPlugins["update"]>) {
    emit("update", this, ...args);
    runLifecycleListeners(this, Lifecycle.Update, false);
    runLifecycleListeners(this, Lifecycle.NextTick);
  }
};

const readyListener = () => {
  ExternalSceneStore.sceneReadyMap.set(sceneKey, true);
};

const fadeInCompleteListener = () => {
  isFading.value = false;
  if (!isInputActive.value) isInputActive.value = true;
};

const fadeOutCompleteListener = () => {
  isFading.value = false;
  if (!isInputActive.value) isInputActive.value = true;
};

const shutdownListener = () => {
  const scene = getScene(sceneKey);
  resetLifecycleListeners(scene, Lifecycle.Update);
  resetLifecycleListeners(scene, Lifecycle.NextTick);
  runLifecycleListeners(scene, Lifecycle.Shutdown);
  scene.cameras.main.off(Cameras.Scene2D.Events.FADE_IN_COMPLETE, fadeInCompleteListener);
  scene.cameras.main.off(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, fadeOutCompleteListener);
  ExternalSceneStore.sceneReadyMap.set(sceneKey, false);
  emit("shutdown", scene);
};

onMounted(async () => {
  const game = useGame();
  const scene = game.scene.add(sceneKey, NewScene) as SceneWithPlugins;
  scene.events.on(Scenes.Events.READY, readyListener);
  scene.events.on(Scenes.Events.SHUTDOWN, shutdownListener);
  if (autoStart) await switchToScene(sceneKey);
});

onUnmounted(() => {
  const game = useGame();
  const scene = getScene(sceneKey);
  scene.events.off(Scenes.Events.READY, readyListener);
  scene.events.off(Scenes.Events.SHUTDOWN, shutdownListener);
  game.scene.remove(sceneKey);
});

provide(InjectionKeyMap.SceneKey, sceneKey);
</script>

<template>
  <slot v-if="isActive" />
</template>
