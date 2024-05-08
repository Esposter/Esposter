<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import { usePhaserStore } from "@/lib/phaser/store";
import { useInputStore } from "@/lib/phaser/store/input";
import { getScene } from "@/lib/phaser/util/getScene";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { JOYSTICK_RADIUS } from "@/services/dungeons/scene/joystick/constants";
import { getJoystickX } from "@/services/dungeons/scene/joystick/getJoystickX";
import { getJoystickY } from "@/services/dungeons/scene/joystick/getJoystickY";
import type { GameObjects } from "phaser";
import type VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick";

const phaserStore = usePhaserStore();
const { rootSceneKey } = storeToRefs(phaserStore);
const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const virtualJoystick = ref<VirtualJoystick>();
const base = ref<GameObjects.Image>();
const thumb = ref<GameObjects.Image>();

watch([base, thumb], ([newBase, newThumb]) => {
  if (!(newBase && newThumb)) return;

  const rootScene = getScene(rootSceneKey.value);
  virtualJoystick.value = rootScene.virtualJoystickPlugin.add(rootScene, {
    x: getJoystickX(),
    y: getJoystickY(rootScene),
    radius: JOYSTICK_RADIUS,
    base: newBase,
    thumb: newThumb,
  });
  controls.value.cursorKeys = virtualJoystick.value.createCursorKeys();
});

onShutdown(() => {
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
