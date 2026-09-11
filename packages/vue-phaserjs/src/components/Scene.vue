<script setup lang="ts">
import type { SceneProps } from "#src/models/scene/SceneProps";
import type { SceneWithPlugins } from "#src/models/scene/SceneWithPlugins";
import type { VNode } from "vue";

import { useGame } from "#src/composables/useGame";
import { useCameraStore } from "#src/store/camera";
import { usePhaserStore } from "#src/store/index";
import { useInputStore } from "#src/store/input";
import { ExternalSceneStore } from "#src/store/scene";
import { createSceneClass } from "#src/util/createSceneClass";
import { getScene } from "#src/util/getScene";
import { runSceneShutdown } from "#src/util/hooks/runSceneShutdown";
import { InjectionKeyMap } from "#src/util/InjectionKeyMap";
import { Cameras, Scenes } from "phaser";

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
const fadeStartListener = () => {
  isInputActive.value = false;
};
const fadeInCompleteListener = () => {
  isFading.value = false;
  isInputActive.value = true;
};
const fadeOutCompleteListener = () => {
  isFading.value = false;
};
const cameraFadeListeners = [
  [Cameras.Scene2D.Events.FADE_IN_START, fadeStartListener],
  [Cameras.Scene2D.Events.FADE_IN_COMPLETE, fadeInCompleteListener],
  [Cameras.Scene2D.Events.FADE_OUT_START, fadeStartListener],
  [Cameras.Scene2D.Events.FADE_OUT_COMPLETE, fadeOutCompleteListener],
] as const;
const NewScene = createSceneClass(sceneKey, {
  onCreate: (scene) => {
    emit("create", scene);
    for (const [event, listener] of cameraFadeListeners) scene.cameras.main.on(event, listener);
    isInputActive.value = true;
  },
  onInit: (scene) => emit("init", scene),
  onPreload: (scene) => emit("preload", scene),
  onUpdate: (scene, time, delta) => emit("update", scene, time, delta),
});

const readyListener = () => {
  ExternalSceneStore.sceneReadyMap.set(sceneKey, true);
};

const shutdownListener = () => {
  const scene = getScene(sceneKey);
  runSceneShutdown(scene);
  for (const [event, listener] of cameraFadeListeners) scene.cameras.main.off(event, listener);
  emit("shutdown", scene);
};

onMounted(async () => {
  const game = useGame();
  const scene = game.scene.add(sceneKey, NewScene);
  if (!scene) {
    console.error(`Failed to add scene: ${sceneKey}`);
    return;
  }
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
