<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import { JOYSTICK_RADIUS } from "@/services/dungeons/scene/joystick/constants";
import { getJoystickX } from "@/services/dungeons/scene/joystick/getJoystickX";
import { getJoystickY } from "@/services/dungeons/scene/joystick/getJoystickY";
import { useGameStore } from "@/store/dungeons/game";
import { Input } from "phaser";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const alpha = ref(1);
</script>

<template>
  <Image
    :configuration="{
      x: scene.scale.width - getJoystickX(),
      y: getJoystickY(scene),
      displayWidth: JOYSTICK_RADIUS,
      displayHeight: JOYSTICK_RADIUS,
      texture: ImageKey.Thumb,
      depth: Number.MAX_SAFE_INTEGER,
      alpha,
      scrollFactor: 0,
    }"
    @[`${Input.Events.GAMEOBJECT_POINTER_DOWN}`]="
      () => {
        alpha = 0.7;
        controls.setInput(PlayerSpecialInput.Confirm);
      }
    "
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="alpha = 1"
    @[`${Input.Events.GAMEOBJECT_POINTER_OUT}`]="alpha = 1"
  />
</template>
