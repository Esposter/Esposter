<script setup lang="ts">
import type { GameObjects } from "phaser";
import type { VirtualJoystick } from "vue-phaserjs";

import { FileKey } from "#shared/generated/phaser/FileKey";
import { JOYSTICK_DEAD_ZONE, JOYSTICK_DEPTH, JOYSTICK_RADIUS } from "#src/services/dungeons/scene/joystick/constants";
import { getJoystickX } from "#src/services/dungeons/scene/joystick/getJoystickX";
import { getJoystickY } from "#src/services/dungeons/scene/joystick/getJoystickY";
import { useControlsStore } from "#src/store/dungeons/controls";
import { createVirtualJoystick, getScene, Image, useInjectSceneKey } from "vue-phaserjs";

const controlsStore = useControlsStore();
const { controls } = storeToRefs(controlsStore);
const virtualJoystick = ref<VirtualJoystick>();
const base = ref<GameObjects.Image>();
const thumb = ref<GameObjects.Image>();
const sceneKey = useInjectSceneKey();

watch([base, thumb], ([newBase, newThumb]) => {
  if (!(newBase && newThumb)) return;

  const scene = getScene(sceneKey);
  newBase.setPosition(getJoystickX(), getJoystickY(scene));
  virtualJoystick.value?.destroy();
  virtualJoystick.value = markRaw(
    createVirtualJoystick(scene, {
      base: newBase,
      deadZone: JOYSTICK_DEAD_ZONE,
      radius: JOYSTICK_RADIUS,
      thumb: newThumb,
    }),
  );
});

watch([virtualJoystick, controls], ([newVirtualJoystick, newControls]) => {
  if (!newVirtualJoystick) return;
  newControls.cursorKeys = newVirtualJoystick.cursorKeys;
});

onUnmounted(() => {
  virtualJoystick.value?.destroy();
});
</script>

<template>
  <Image
    :configuration="{
      displayWidth: JOYSTICK_RADIUS * 2,
      displayHeight: JOYSTICK_RADIUS * 2,
      texture: FileKey.UIJoystickBase,
      depth: JOYSTICK_DEPTH,
    }"
    :on-complete="
      (_scene, image) => {
        base = markRaw(image);
      }
    "
  />
  <Image
    :configuration="{
      displayWidth: JOYSTICK_RADIUS,
      displayHeight: JOYSTICK_RADIUS,
      texture: FileKey.UIJoystickThumb,
      depth: JOYSTICK_DEPTH,
    }"
    :on-complete="
      (_scene, image) => {
        thumb = markRaw(image);
      }
    "
  />
</template>
