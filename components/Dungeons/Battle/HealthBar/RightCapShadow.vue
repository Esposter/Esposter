<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { ImageKey } from "@/models/dungeons/keys/ImageKey";
import { type Position } from "grid-engine";

interface RightCapShadowProps {
  position: Position;
  scaleY: number;
}

const { position, scaleY } = defineProps<RightCapShadowProps>();
</script>

<template>
  <Image
    :configuration="{
      ...position,
      textureKey: ImageKey.HealthBarRightCapShadow,
      originX: 0,
      originY: 0.5,
      scaleY,
    }"
  />
</template>
