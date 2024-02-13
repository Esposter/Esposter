<script setup lang="ts">
import Circle from "@/lib/phaser/components/Circle.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { JOYSTICK_RADIUS } from "@/services/dungeons/joystick/constants";
import { getJoystickX } from "@/services/dungeons/joystick/getJoystickX";
import { getJoystickY } from "@/services/dungeons/joystick/getJoystickY";
import { useGameStore } from "@/store/dungeons/game";
import isMobile from "is-mobile";
import { type GameObjects } from "phaser";
import type VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick";

const phaserStore = usePhaserStore();
const { game, scene } = storeToRefs(phaserStore);
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const base = ref<GameObjects.Arc>();
const thumb = ref<GameObjects.Arc>();
const virtualJoystick = ref<VirtualJoystick>();

watch([base, thumb], ([newBase, newThumb]) => {
  if (!(game.value && newBase && newThumb)) return;

  virtualJoystick.value = scene.value.virtualJoystickPlugin.add(scene.value, {
    x: getJoystickX(),
    y: getJoystickY(scene.value),
    radius: JOYSTICK_RADIUS,
    base: newBase,
    thumb: newThumb,
  });
  controls.value.cursorKeys = virtualJoystick.value.createCursorKeys();
});

usePhaserListener("resize", () => {
  if (!virtualJoystick.value) return;
  virtualJoystick.value.y = getJoystickY(scene.value);
});
</script>

<template>
  <template v-if="isMobile()">
    <Circle
      :configuration="{ radius: JOYSTICK_RADIUS, fillColor: 0x888888, depth: Number.MAX_SAFE_INTEGER }"
      :on-complete="
        (circle) => {
          base = circle;
        }
      "
    />
    <Circle
      :configuration="{ radius: JOYSTICK_RADIUS / 2, fillColor: 0xcccccc, depth: Number.MAX_SAFE_INTEGER }"
      :on-complete="
        (circle) => {
          thumb = circle;
        }
      "
    />
  </template>
</template>
