<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import { TextureManagerKey } from "@/models/dungeons/keys/TextureManagerKey";
import { type Position } from "grid-engine";

interface MiddleShadowProps {
  position: Position;
  scaleY: number;
  displayWidth: number;
}

const { position, scaleY, displayWidth } = defineProps<MiddleShadowProps>();
</script>

<template>
  <Image
    :configuration="{
      ...position,
      textureKey: TextureManagerKey.HealthBarMiddleShadow,
      originX: 0,
      originY: 0.5,
      scaleY,
      displayWidth,
    }"
  />
</template>
