<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { JOYSTICK_RADIUS } from "@/services/dungeons/joystick/constants";
import { getJoystickX } from "@/services/dungeons/joystick/getJoystickX";
import { getJoystickY } from "@/services/dungeons/joystick/getJoystickY";
import { useGameStore } from "@/store/dungeons/game";
import isMobile from "is-mobile";
import type { GameObjects } from "phaser";
import type VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick";

const phaserStore = usePhaserStore();
const { scene, sceneKey } = storeToRefs(phaserStore);
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

usePhaserListener(`${BEFORE_DESTROY_SCENE_EVENT_KEY}${sceneKey.value}`, () => {
  if (!virtualJoystick.value) return;
  virtualJoystick.value.destroy();
});
</script>

<template>
  <template v-if="isMobile()">
    <Image
      :configuration="{ textureKey: ImageKey.Base, depth: Number.MAX_SAFE_INTEGER }"
      :on-complete="
        (image) => {
          base = image;
        }
      "
    />
    <Image
      :configuration="{ textureKey: ImageKey.Thumb, depth: Number.MAX_SAFE_INTEGER }"
      :on-complete="
        (image) => {
          thumb = image;
        }
      "
    />
  </template>
</template>
