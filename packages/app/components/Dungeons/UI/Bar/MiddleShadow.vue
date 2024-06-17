<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import type { ImagePosition } from "@/models/dungeons/ImagePosition";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

interface MiddleShadowProps {
  imagePosition: ImagePosition;
  scaleY: number;
  displayWidth: number;
}

const { imagePosition, scaleY, displayWidth } = defineProps<MiddleShadowProps>();
</script>

<template>
  <Image :configuration="{ ...imagePosition, texture: ImageKey.BarMiddleShadow, scaleY, displayWidth }" />
</template>
