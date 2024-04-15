<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { JOYSTICK_RADIUS } from "@/services/dungeons/joystick/constants";
import { getJoystickX } from "@/services/dungeons/joystick/getJoystickX";
import { getJoystickY } from "@/services/dungeons/joystick/getJoystickY";
import { useGameStore } from "@/store/dungeons/game";
import type { GameObjects } from "phaser";
import type VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const virtualJoystick = ref<VirtualJoystick>();
const base = ref<GameObjects.Image>();
const thumb = ref<GameObjects.Image>();

watch([base, thumb], ([newBase, newThumb]) => {
  if (!(newBase && newThumb)) return;

  virtualJoystick.value = scene.value.virtualJoystickPlugin.add(scene.value, {
    x: getJoystickX(),
    y: getJoystickY(scene.value),
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
      (image) => {
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
      (image) => {
        thumb = image;
      }
    "
  />
</template>
