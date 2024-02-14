<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { getJoystickX } from "@/services/dungeons/joystick/getJoystickX";
import { getJoystickY } from "@/services/dungeons/joystick/getJoystickY";
import { useGameStore } from "@/store/dungeons/game";
import isMobile from "is-mobile";
import { Input, type GameObjects } from "phaser";
import type VirtualJoystick from "phaser3-rex-plugins/plugins/virtualjoystick";

const phaserStore = usePhaserStore();
const { game, scene } = storeToRefs(phaserStore);
const gameStore = useGameStore();
const { controls } = storeToRefs(gameStore);
const confirmThumbJoystick = ref<VirtualJoystick>();
const confirmThumb = ref<GameObjects.Image>();
const confirmThumbAlpha = ref(1);

watch(confirmThumb, (newConfirmThumb) => {
  if (!(game.value && newConfirmThumb)) return;

  confirmThumbJoystick.value = scene.value.virtualJoystickPlugin.add(scene.value, {
    x: scene.value.scale.width - getJoystickX(),
    y: getJoystickY(scene.value),
    radius: 0,
    thumb: newConfirmThumb,
    enable: false,
  });
});

usePhaserListener(`${BEFORE_DESTROY_SCENE_EVENT_KEY}${SceneKey.World}`, () => {
  if (!confirmThumbJoystick.value) return;
  confirmThumbJoystick.value.destroy();
});
</script>

<template>
  <Image
    v-if="isMobile()"
    :configuration="{
      textureKey: ImageKey.Thumb,
      depth: Number.MAX_SAFE_INTEGER,
      alpha: confirmThumbAlpha,
    }"
    :on-complete="
      (image) => {
        confirmThumb = image;
      }
    "
    @[`${Input.Events.GAMEOBJECT_POINTER_DOWN}`]="
      () => {
        confirmThumbAlpha = 0.7;
        controls.setInput(PlayerSpecialInput.Confirm);
      }
    "
    @[`${Input.Events.GAMEOBJECT_POINTER_UP}`]="confirmThumbAlpha = 1"
    @[`${Input.Events.GAMEOBJECT_POINTER_OUT}`]="confirmThumbAlpha = 1"
  />
</template>
