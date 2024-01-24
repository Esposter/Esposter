<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { GAME_OBJECT_KEY } from "@/lib/phaser/util/constants";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { type Position } from "grid-engine";
import { type GameObjects } from "phaser";

interface LeftCapProps {
  position: Position;
  scaleY: number;
}

const { position, scaleY } = defineProps<LeftCapProps>();
const gameObject = ref<{ [GAME_OBJECT_KEY]: GameObjects.Image }>();
defineExpose({ [GAME_OBJECT_KEY]: gameObject });
</script>

<template>
  <Image
    ref="gameObject"
    :configuration="{
      ...position,
      textureKey: TextureManagerKey.HealthBarLeftCap,
      // Set origin to the middle-left of the health caps to enable
      // grabbing the full width of the game object
      originX: 0,
      originY: 0.5,
      scaleY,
    }"
  />
</template>
