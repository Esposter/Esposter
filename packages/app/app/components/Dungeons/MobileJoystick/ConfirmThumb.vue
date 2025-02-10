<script setup lang="ts">
import { FileKey } from "#shared/generated/phaser/FileKey";
import { PlayerSpecialInput } from "@/models/dungeons/UI/input/PlayerSpecialInput";
import { JOYSTICK_RADIUS } from "@/services/dungeons/scene/joystick/constants";
import { getJoystickX } from "@/services/dungeons/scene/joystick/getJoystickX";
import { getJoystickY } from "@/services/dungeons/scene/joystick/getJoystickY";
import { useControlsStore } from "@/store/dungeons/controls";
import { Input } from "phaser";
import { Image, onCreate } from "vue-phaserjs";

const controlsStore = useControlsStore();
const { controls } = storeToRefs(controlsStore);
const alpha = ref(1);
const x = ref<number>();
const y = ref<number>();

onCreate((scene) => {
  x.value = scene.scale.width - getJoystickX();
  y.value = getJoystickY(scene);
});
</script>

<template>
  <Image
    :configuration="{
      x,
      y,
      displayWidth: JOYSTICK_RADIUS,
      displayHeight: JOYSTICK_RADIUS,
      texture: FileKey.UIJoystickThumb,
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
