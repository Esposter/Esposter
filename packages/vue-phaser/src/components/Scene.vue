<script setup lang="ts">
import type { SceneKey } from "@/models/keys/SceneKey";
import type { SceneWithPlugins } from "@/models/scene/SceneWithPlugins";

import { useGame } from "@/composables/useGame";
import { Lifecycle } from "@/models/lifecycle/Lifecycle";
import { usePhaserStore } from "@/store";
import { ExternalSceneStore } from "@/store/scene";
import { getScene } from "@/utils/getScene";
import { InjectionKeyMap } from "@/utils/InjectionKeyMap";
import { Scene, Scenes } from "phaser";

interface SceneProps {
  autoStart?: true;
  sceneKey: SceneKey;
}

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
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
const { parallelSceneKeys } = storeToRefs(phaserStore);
const isActive = computed(() => isSameScene(sceneKey) || parallelSceneKeys.value.includes(sceneKey));
const NewScene = class extends Scene {
  create(this: SceneWithPlugins) {
    emit("create", this);
    const createListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Create];
    for (const createListener of createListenersMap[this.scene.key]) createListener(this);
    createListenersMap[this.scene.key] = [];
  }

  init(this: SceneWithPlugins) {
    emit("init", this);
    const initListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Init];
    for (const initListener of initListenersMap[this.scene.key]) initListener(this);
    initListenersMap[this.scene.key] = [];
  }

  preload(this: SceneWithPlugins) {
    emit("preload", this);
    const preloadListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Preload];
    for (const preloadListener of preloadListenersMap[this.scene.key]) preloadListener(this);
    preloadListenersMap[this.scene.key] = [];
  }

  update(this: SceneWithPlugins, ...args: Parameters<SceneWithPlugins["update"]>) {
    emit("update", this, ...args);
    const updateListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Update];
    for (const updateListener of updateListenersMap[this.scene.key]) updateListener(this);

    const nextTickListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.NextTick];
    for (const nextTickListener of nextTickListenersMap[this.scene.key]) nextTickListener(this);
    nextTickListenersMap[this.scene.key] = [];
  }
};

const readyListener = () => {
  ExternalSceneStore.sceneReadyMap[sceneKey] = true;
};

const shutdownListener = () => {
  const updateListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Update];
  updateListenersMap[sceneKey] = [];

  const nextTickListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.NextTick];
  nextTickListenersMap[sceneKey] = [];

  const scene = getScene(sceneKey);
  const shutdownListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Shutdown];
  for (const shutdownListener of shutdownListenersMap[sceneKey]) shutdownListener(scene);
  shutdownListenersMap[sceneKey] = [];
  emit("shutdown", scene);

  ExternalSceneStore.sceneReadyMap[sceneKey] = false;
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
