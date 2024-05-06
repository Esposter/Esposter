<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { onCreate } from "@/lib/phaser/hooks/onCreate";
import { onShutdown } from "@/lib/phaser/hooks/onShutdown";
import { useInputStore } from "@/lib/phaser/store/phaser/input";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import type { SceneWithPlugins } from "@/models/dungeons/scene/SceneWithPlugins";
import { JOYSTICK_RADIUS } from "@/services/dungeons/scene/joystick/constants";
import { getJoystickX } from "@/services/dungeons/scene/joystick/getJoystickX";
import { getJoystickY } from "@/services/dungeons/scene/joystick/getJoystickY";
import type { GameObjects } from "phaser";
import type VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick";

const inputStore = useInputStore();
const { controls } = storeToRefs(inputStore);
const virtualJoystick = ref<VirtualJoystick>();
const scene = ref<SceneWithPlugins>();
const base = ref<GameObjects.Image>();
const thumb = ref<GameObjects.Image>();

onCreate((newScene) => {
  scene.value = newScene;
});

watch([scene, base, thumb], ([newScene, newBase, newThumb]) => {
  if (!(newScene && newBase && newThumb)) return;

  virtualJoystick.value = newScene.virtualJoystickPlugin.add(newScene, {
    x: getJoystickX(),
    y: getJoystickY(newScene),
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
