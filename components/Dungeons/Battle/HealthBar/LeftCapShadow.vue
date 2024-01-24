<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { type Position } from "grid-engine";

interface LeftCapShadowProps {
  position: Position;
  scaleY: number;
}

const { position, scaleY } = defineProps<LeftCapShadowProps>();
</script>

<template>
  <Image
    :configuration="{
      ...position,
      textureKey: TextureManagerKey.HealthBarLeftCapShadow,
      originX: 0,
      originY: 0.5,
      scaleY,
    }"
  />
</template>
