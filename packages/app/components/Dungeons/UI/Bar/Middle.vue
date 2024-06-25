<script setup lang="ts">
import Image from "@/lib/phaser/components/Image.vue";
import type { TweenBuilderConfiguration } from "@/lib/phaser/models/configuration/shared/TweenBuilderConfiguration";
import type { ImagePosition } from "@/models/dungeons/ImagePosition";
import type { ImageKey } from "@/models/dungeons/keys/image/ImageKey";

interface MiddleProps {
  imagePosition: ImagePosition;
  texture: ImageKey;
  displayWidth: number | undefined;
  scaleY: number;
  tween?: TweenBuilderConfiguration;
}

const { imagePosition, texture, displayWidth, scaleY, tween } = defineProps<MiddleProps>();
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
