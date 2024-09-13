<script setup lang="ts">
import type { SceneProps, SceneWithPlugins } from "vue-phaser";

import { SoundSetting } from "@/models/dungeons/data/settings/SoundSetting";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useVolumeStore } from "@/store/dungeons/settings/volume";
import { Cameras } from "phaser";
import { getScene, Scene, useCameraStore, useInputStore } from "vue-phaser";

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const props = defineProps<SceneProps>();
const emit = defineEmits<{
  create: [SceneWithPlugins];
  init: [SceneWithPlugins];
  preload: [SceneWithPlugins];
  shutdown: [SceneWithPlugins];
  update: [SceneWithPlugins, ...Parameters<SceneWithPlugins["update"]>];
}>();
const cameraStore = useCameraStore();
const { isFading } = storeToRefs(cameraStore);
const inputStore = useInputStore();
const { isInputActive } = storeToRefs(inputStore);
const settingsStore = useSettingsStore();
const { settings } = storeToRefs(settingsStore);
const volumeStore = useVolumeStore();
const { volumePercentage } = storeToRefs(volumeStore);

const onCreate = (scene: SceneWithPlugins) => {
  emit("create", scene);
  // MobileJoystick is an always active side scene
  if (scene.scene.key !== SceneKey.MobileJoystick) initializeRootScene(scene);
};

const initializeRootScene = (scene: SceneWithPlugins) => {
  useInitializeControls(scene);

  if (!isInputActive.value) isInputActive.value = true;

  initializeSoundSetting(scene, settings.value.Sound);
  initializeVolumeSetting(scene, settings.value.Volume);

  scene.cameras.main.on(Cameras.Scene2D.Events.FADE_IN_COMPLETE, fadeInCompleteListener);
  scene.cameras.main.on(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, fadeOutCompleteListener);
};

const onShutdown = (scene: SceneWithPlugins) => {
  emit("shutdown", scene);
  scene.cameras.main.off(Cameras.Scene2D.Events.FADE_IN_COMPLETE, fadeInCompleteListener);
  scene.cameras.main.off(Cameras.Scene2D.Events.FADE_OUT_COMPLETE, fadeOutCompleteListener);
};

const fadeInCompleteListener = () => {
  isFading.value = false;
  if (!isInputActive.value) isInputActive.value = true;
};

const fadeOutCompleteListener = () => {
  isFading.value = false;
  if (!isInputActive.value) isInputActive.value = true;
};

const initializeSoundSetting = (scene: SceneWithPlugins, soundSetting: SoundSetting) => {
  scene.sound.setMute(soundSetting === SoundSetting.Off);
};
const initializeVolumeSetting = (scene: SceneWithPlugins, volumePercentage: number) => {
  scene.sound.setVolume(volumePercentage / 100);
};

watch(
  () => settings.value.Sound,
  (newSoundSetting) => {
    const scene = getScene(props.sceneKey);
    initializeSoundSetting(scene, newSoundSetting);
  },
);

watch(volumePercentage, (newVolumePercentage) => {
  const scene = getScene(props.sceneKey);
  initializeVolumeSetting(scene, newVolumePercentage);
});
</script>

<template>
  <Scene
    :="props"
    @create="onCreate"
    @init="(...args) => emit('init', ...args)"
    @preload="(...args) => emit('preload', ...args)"
    @update="(...args) => emit('update', ...args)"
    @shutdown="onShutdown"
  >
    <slot />
  </Scene>
</template>
