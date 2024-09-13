<script setup lang="ts">
import type { ImagePosition } from "@/models/dungeons/ImagePosition";
import type { ImageKey } from "@/models/dungeons/keys/image/ImageKey";
import type { TweenBuilderConfiguration } from "vue-phaserjs";

import { Image } from "vue-phaserjs";

interface MiddleProps {
  displayWidth: number | undefined;
  imagePosition: ImagePosition;
  scaleY: number;
  texture: ImageKey;
  tween?: TweenBuilderConfiguration;
}

const { displayWidth, imagePosition, scaleY, texture, tween } = defineProps<MiddleProps>();
const isVisible = computed(() => (displayWidth ?? 0) > 0);
</script>

<template>
  <Image
    :configuration="{
      visible: isVisible,
      ...imagePosition,
      texture,
      displayWidth,
      scaleY,
      tween,
    }"
  />
</template>
