<script setup lang="ts">
import type { GameObjects } from "phaser";
import type VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick";

import Image from "@/lib/phaser/components/Image.vue";
import { useInjectSceneKey } from "@/lib/phaser/composables/useInjectSceneKey";
import { useInputStore } from "@/lib/phaser/store/input";
import { getScene } from "@/lib/phaser/util/getScene";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { JOYSTICK_RADIUS } from "@/services/dungeons/scene/joystick/constants";
import { getJoystickX } from "@/services/dungeons/scene/joystick/getJoystickX";
import { getJoystickY } from "@/services/dungeons/scene/joystick/getJoystickY";

const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const virtualJoystick = ref<VirtualJoystick>();
const base = ref<GameObjects.Image>();
const thumb = ref<GameObjects.Image>();
const sceneKey = useInjectSceneKey();

watch([base, thumb], ([newBase, newThumb]) => {
  if (!(newBase && newThumb)) return;

  const scene = getScene(sceneKey);
  virtualJoystick.value = scene.virtualJoystickPlugin.add(scene, {
    base: newBase,
    radius: JOYSTICK_RADIUS,
    thumb: newThumb,
    x: getJoystickX(),
    y: getJoystickY(scene),
  });
});

watch([virtualJoystick, controls], ([newVirtualJoystick, newControls]) => {
  if (!newVirtualJoystick) return;
  newControls.cursorKeys = newVirtualJoystick.createCursorKeys();
});

onUnmounted(() => {
  if (!virtualJoystick.value) return;
  virtualJoystick.value.destroy();
});
</script>

<template>
  <Image
    :configuration="{
      displayWidth: JOYSTICK_RADIUS * 2,
      displayHeight: JOYSTICK_RADIUS * 2,
      texture: ImageKey.Base,
      depth: Number.MAX_SAFE_INTEGER,
    }"
    :on-complete="
      (_scene, image) => {
        base = image;
      }
    "
  />
  <Image
    :configuration="{
      displayWidth: JOYSTICK_RADIUS,
      displayHeight: JOYSTICK_RADIUS,
      texture: ImageKey.Thumb,
      depth: Number.MAX_SAFE_INTEGER,
    }"
    :on-complete="
      (_scene, image) => {
        thumb = image;
      }
    "
  />
</template>
