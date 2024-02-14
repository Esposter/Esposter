<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { usePhaserStore } from "@/lib/phaser/store/phaser";
import { BEFORE_DESTROY_SCENE_EVENT_KEY } from "@/lib/phaser/util/constants";
import { PlayerSpecialInput } from "@/models/dungeons/input/PlayerSpecialInput";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { SceneKey } from "@/models/dungeons/keys/SceneKey";
import { JOYSTICK_RADIUS } from "@/services/dungeons/joystick/constants";
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
const virtualJoystick = ref<VirtualJoystick>();
const confirmThumbJoystick = ref<VirtualJoystick>();
const base = ref<GameObjects.Image>();
const thumb = ref<GameObjects.Image>();
const confirmThumb = ref<GameObjects.Image>();
const confirmThumbAlpha = ref(1);

watch([base, thumb, confirmThumb], ([newBase, newThumb, newConfirmThumb]) => {
  if (!(game.value && newBase && newThumb && newConfirmThumb)) return;

  const y = getJoystickY(scene.value);
  virtualJoystick.value = scene.value.virtualJoystickPlugin.add(scene.value, {
    x: getJoystickX(),
    y,
    radius: JOYSTICK_RADIUS,
    base: newBase,
    thumb: newThumb,
  });
  confirmThumbJoystick.value = scene.value.virtualJoystickPlugin.add(scene.value, {
    x: scene.value.scale.width - getJoystickX(),
    y,
    radius: 0,
    thumb: newConfirmThumb,
  });
  controls.value.cursorKeys = virtualJoystick.value.createCursorKeys();
});

usePhaserListener(`${BEFORE_DESTROY_SCENE_EVENT_KEY}${SceneKey.World}`, () => {
  if (!(virtualJoystick.value && confirmThumbJoystick.value)) return;
  virtualJoystick.value.destroy();
  confirmThumbJoystick.value.destroy();
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
    <Image
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
</template>
