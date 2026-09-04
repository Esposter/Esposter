<script setup lang="ts">
import type { ImagePosition } from "@/models/dungeons/ImagePosition";

import { BarShadowTextureMap } from "@/services/dungeons/UI/bar/BarTextureMap";

interface Props {
  imagePosition: ImagePosition;
  scaleY: number;
  width: number;
}

const { imagePosition, scaleY, width } = defineProps<Props>();
const leftCapShadowDisplayWidth = ref<number>();
const rightCapShadowDisplayWidth = ref<number>();
// The shadow is always full: the middle takes whatever the two caps leave, where the bar in front of it has a
// Fill to animate and gets its widths from `useDisplayWidths`
const middleShadowDisplayWidth = computed(
  () => width - ((leftCapShadowDisplayWidth.value ?? 0) + (rightCapShadowDisplayWidth.value ?? 0)),
);
</script>

<template>
  <DungeonsUIBarSegments
    v-model:left-cap-display-width="leftCapShadowDisplayWidth"
    v-model:right-cap-display-width="rightCapShadowDisplayWidth"
    :image-position
    :middle-display-width="middleShadowDisplayWidth"
    :scale-y
    :textures="BarShadowTextureMap"
  />
</template>
