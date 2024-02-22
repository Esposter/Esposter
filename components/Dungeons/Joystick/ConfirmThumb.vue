<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { getJoystickRadius } from "@/services/dungeons/joystick/getJoystickRadius";
import { getJoystickX } from "@/services/dungeons/joystick/getJoystickX";
import { getJoystickY } from "@/services/dungeons/joystick/getJoystickY";
import { useGameStore } from "@/store/dungeons/game";
import isMobile from "is-mobile";
import { Input } from "phaser";

const phaserStore = usePhaserStore();
const { scene } = storeToRefs(phaserStore);
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const joystickRadius = computed(() => getJoystickRadius(scene.value));
const alpha = ref(1);
</script>

<template>
  <Image
    v-if="isMobile()"
    :configuration="{
      x: scene.scale.width - getJoystickX(scene),
      y: getJoystickY(scene),
      displayWidth: joystickRadius,
      displayHeight: joystickRadius,
      textureKey: ImageKey.Thumb,
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
