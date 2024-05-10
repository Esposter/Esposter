<script setup lang="ts">
import { useGame } from "@/lib/phaser/composables/useGame";
import { useInitializeControls } from "@/lib/phaser/composables/useInitializeControls";
import { Lifecycle } from "@/lib/phaser/models/lifecycle/Lifecycle";
import { usePhaserStore } from "@/lib/phaser/store";
import { useCameraStore } from "@/lib/phaser/store/camera";
import { useInputStore } from "@/lib/phaser/store/input";
import { ExternalSceneStore } from "@/lib/phaser/store/scene";
import { InjectionKeyMap } from "@/lib/phaser/util/InjectionKeyMap";
import { getScene } from "@/lib/phaser/util/getScene";
import { SoundSetting } from "@/models/dungeons/data/settings/SoundSetting";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useVolumeStore } from "@/store/dungeons/settings/volume";
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
const { isSameScene, switchToScene } = phaserStore;
const { parallelSceneKeys } = storeToRefs(phaserStore);
const isActive = computed(() => isSameScene(sceneKey) || parallelSceneKeys.value.includes(sceneKey));
const cameraStore = useCameraStore();
const { isFading } = storeToRefs(cameraStore);
const inputStore = useInputStore();
const { isInputActive } = storeToRefs(inputStore);
const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);
const volumeStore = useVolumeStore();
const { volumePercentage } = storeToRefs(volumeStore);
const NewScene = class extends SceneWithPlugins {
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

  create(this: SceneWithPlugins) {
    emit("create", this);
    // MobileJoystick is an always active side scene
    if (this.scene.key !== SceneKey.MobileJoystick) initializeRootScene(this);

    const createListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Create];
    for (const createListener of createListenersMap[this.scene.key]) createListener(this);
    createListenersMap[this.scene.key] = [];
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

const initializeRootScene = (scene: SceneWithPlugins) => {
  useInitializeControls(scene);
  if (!isInputActive.value) isInputActive.value = true;
};

const fadeInCompleteListener = () => {
  isFading.value = false;
  if (!isInputActive.value) isInputActive.value = true;
};

const fadeOutCompleteListener = () => {
  isFading.value = false;
  if (!isInputActive.value) isInputActive.value = true;
};

const readyListener = () => {
  ExternalSceneStore.sceneReadyMap[sceneKey] = true;
};

const shutdownListener = () => {
  const updateListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Update];
  updateListenersMap[sceneKey] = [];

  const newScene = getScene(sceneKey);
  const shutdownListenersMap = ExternalSceneStore.lifeCycleListenersMap[Lifecycle.Shutdown];
  for (const shutdownListener of shutdownListenersMap[sceneKey]) shutdownListener(newScene);
  shutdownListenersMap[sceneKey] = [];
  emit("shutdown", newScene);

  ExternalSceneStore.sceneReadyMap[sceneKey] = false;
};

onMounted(() => {
  const game = useGame();
  const scene = game.scene.add(sceneKey, NewScene) as SceneWithPlugins;
  initializeSound();
  initializeVolume();
  scene.events.on(Scenes.Events.READY, readyListener);
  scene.events.on(Scenes.Events.SHUTDOWN, shutdownListener);
  scene.cameras.main.on(Cameras.Scene2D.Events.FADE_IN_COMPLETE, fadeInCompleteListener);
  scene.cameras.main.on(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, fadeOutCompleteListener);
  if (autoStart) switchToScene(sceneKey);
});

const { trigger: initializeSound } = watchTriggerable(
  () => settings.value.Sound,
  (newSound) => {
    const scene = getScene(sceneKey);
    scene.sound.setMute(newSound === SoundSetting.Off);
  },
);

const { trigger: initializeVolume } = watchTriggerable(volumePercentage, (newVolumePercentage) => {
  const scene = getScene(sceneKey);
  scene.sound.setVolume(newVolumePercentage / 100);
});

onUnmounted(() => {
  const game = useGame();
  const scene = getScene(sceneKey);
  scene.events.off(Scenes.Events.READY, readyListener);
  scene.events.off(Scenes.Events.SHUTDOWN, shutdownListener);
  scene.cameras.main.off(Cameras.Scene2D.Events.FADE_IN_COMPLETE, fadeInCompleteListener);
  scene.cameras.main.off(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, fadeOutCompleteListener);
  game.scene.remove(sceneKey);
});

provide(InjectionKeyMap.SceneKey, sceneKey);
</script>

<template>
  <slot v-if="isActive" />
</template>
