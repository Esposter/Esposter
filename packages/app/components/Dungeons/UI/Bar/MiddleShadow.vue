<script setup lang="ts">
import type { ImagePosition } from "@/models/dungeons/ImagePosition";

import Image from "@/lib/phaser/components/Image.vue";
import { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

interface MiddleShadowProps {
  displayWidth: number;
  imagePosition: ImagePosition;
  scaleY: number;
}

const { displayWidth, imagePosition, scaleY } = defineProps<MiddleShadowProps>();
</script>

<template>
  <Image :configuration="{ ...imagePosition, texture: ImageKey.BarMiddleShadow, scaleY, displayWidth }" />
</template>
