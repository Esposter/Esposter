<script setup lang="ts">
import type { SceneProps, SceneWithPlugins } from "vue-phaserjs";

import { SoundSetting } from "@/models/dungeons/data/settings/SoundSetting";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { useSettingsStore } from "@/store/dungeons/settings";
import { useVolumeStore } from "@/store/dungeons/settings/volume";
import { getScene, Scene } from "vue-phaserjs";

defineSlots<{ default: (props: Record<string, never>) => unknown }>();
const props = defineProps<SceneProps>();
const emit = defineEmits<{
  create: [SceneWithPlugins];
  init: [SceneWithPlugins];
  preload: [SceneWithPlugins];
  shutdown: [SceneWithPlugins];
  update: [SceneWithPlugins, ...Parameters<SceneWithPlugins["update"]>];
}>();
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
  setSoundSetting(scene, settings.value.Sound);
  setVolumePercentage(scene, settings.value.Volume);
};

const setSoundSetting = (scene: SceneWithPlugins, soundSetting: SoundSetting) => {
  scene.sound.setMute(soundSetting === SoundSetting.Off);
};

const setVolumePercentage = (scene: SceneWithPlugins, volumePercentage: number) => {
  scene.sound.setVolume(volumePercentage / 100);
};

watch(
  () => settings.value.Sound,
  (newSoundSetting) => {
    const scene = getScene(props.sceneKey);
    setSoundSetting(scene, newSoundSetting);
  },
);

watch(volumePercentage, (newVolumePercentage) => {
  const scene = getScene(props.sceneKey);
  setVolumePercentage(scene, newVolumePercentage);
});
</script>

<template>
  <Scene
    :="props"
    @create="onCreate"
    @init="(...args) => emit('init', ...args)"
    @preload="(...args) => emit('preload', ...args)"
    @update="(...args) => emit('update', ...args)"
    @shutdown="(...args) => emit('shutdown', ...args)"
  >
    <slot />
  </Scene>
</template>
