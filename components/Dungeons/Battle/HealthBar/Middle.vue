<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { GAME_OBJECT_KEY } from "@/lib/phaser/util/constants";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { type Position } from "grid-engine";
import { type GameObjects } from "phaser";

interface MiddleProps {
  position: Position;
  scaleY: number;
  displayWidth: number;
}

const { position, scaleY, displayWidth } = defineProps<MiddleProps>();
const gameObject = ref<{ [GAME_OBJECT_KEY]: GameObjects.Image }>();
defineExpose({ [GAME_OBJECT_KEY]: gameObject });
</script>

<template>
  <Image
    ref="gameObject"
    :configuration="{
      ...position,
      textureKey: TextureManagerKey.HealthBarMiddle,
      originX: 0,
      originY: 0.5,
      scaleY,
      displayWidth,
    }"
  />
</template>
