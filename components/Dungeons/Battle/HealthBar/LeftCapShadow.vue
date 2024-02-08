<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { type Position } from "grid-engine";

interface LeftCapShadowProps {
  position: Position;
  scaleY: number;
}

const { position, scaleY } = defineProps<LeftCapShadowProps>();
const displayWidth = defineModel<number | undefined>("displayWidth", { required: true });
</script>

<template>
  <Image
    :configuration="{
      ...position,
      textureKey: ImageKey.HealthBarLeftCapShadow,
      originX: 0,
      originY: 0.5,
      scaleY,
      displayWidth,
    }"
    @update:display-width="(value: typeof displayWidth) => (displayWidth = value)"
  />
</template>
