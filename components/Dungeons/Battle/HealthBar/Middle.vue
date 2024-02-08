<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { type Position } from "grid-engine";

interface MiddleProps {
  position: Position;
  scaleY: number;
  displayWidth: number;
}

const { position, scaleY, displayWidth } = defineProps<MiddleProps>();
</script>

<template>
  <Image
    :configuration="{
      ...position,
      textureKey: ImageKey.HealthBarMiddle,
      originX: 0,
      originY: 0.5,
      scaleY,
      displayWidth,
    }"
  />
</template>
