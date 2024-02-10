<script setup lang="ts">
import Circle from "@/lib/phaser/components/Circle.vue";
import { phaserEventEmitter } from "@/lib/phaser/events/phaser";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { JOYSTICK_RADIUS } from "@/services/dungeons/joystick/constants";
import { getJoystickX } from "@/services/dungeons/joystick/getJoystickX";
import { getJoystickY } from "@/services/dungeons/joystick/getJoystickY";
import { useGameStore } from "@/store/dungeons/game";
import isMobile from "is-mobile";
import { Input, type GameObjects, type Types } from "phaser";
import type VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const base = ref<GameObjects.Arc>();
const thumb = ref<GameObjects.Arc>();
const virtualJoystick = ref<VirtualJoystick>();
const isVirtualJoystickPressed = ref(false);
const resizeListener = () => {
  if (!virtualJoystick.value) return;
  virtualJoystick.value.y = getJoystickY(scene.value);
};
const pointerUpListener = () => {
  if (isVirtualJoystickPressed.value) {
    isVirtualJoystickPressed.value = false;
    return;
  }

  controls.value.setInput(PlayerSpecialInput.Confirm);
};

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
  scene.value.input.on(Input.Events.POINTER_UP, pointerUpListener);
  phaserEventEmitter.on("resize", resizeListener);
});

onUnmounted(() => {
  phaserEventEmitter.off("resize", resizeListener);
  scene.value.input.off(Input.Events.POINTER_UP, pointerUpListener);
  scene.value.virtualJoystickPlugin.destroy();
});
</script>

<template>
  <template v-if="!isMobile()">
    <Circle
      :configuration="{ radius: JOYSTICK_RADIUS, fillColor: 0x888888, depth: Number.MAX_SAFE_INTEGER }"
      :on-complete="
        (circle) => {
          base = circle;
        }
      "
      @[`${Input.Events.POINTER_DOWN}`]="isVirtualJoystickPressed = true"
      @[`${Input.Events.POINTER_UP}`]="
        (pointer: Types.Input.EventData) => {
          pointer.stopPropagation();
          isVirtualJoystickPressed = false;
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
      @[`${Input.Events.POINTER_DOWN}`]="isVirtualJoystickPressed = true"
      @[`${Input.Events.POINTER_UP}`]="
        (pointer: Types.Input.EventData) => {
          pointer.stopPropagation();
          isVirtualJoystickPressed = false;
        }
      "
    />
  </template>
</template>
