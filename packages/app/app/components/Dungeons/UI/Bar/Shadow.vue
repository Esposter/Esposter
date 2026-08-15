<script setup lang="ts">
import type { ImagePosition } from "@/models/dungeons/ImagePosition";

import { ImageKey } from "#shared/models/dungeons/keys/image/ImageKey";

interface ShadowProps {
  imagePosition: ImagePosition;
  scaleY: number;
  width: number;
}

const { imagePosition, scaleY, width } = defineProps<ShadowProps>();
const leftCapShadowDisplayWidth = ref<number>();
const middleShadowX = computed(() => imagePosition.x + (leftCapShadowDisplayWidth.value ?? 0));
const middleShadowDisplayWidth = computed(
  () => width - ((leftCapShadowDisplayWidth.value ?? 0) + (rightCapShadowDisplayWidth.value ?? 0)),
);
const rightCapShadowDisplayWidth = ref<number>();
const rightCapShadowX = computed(() => middleShadowX.value + middleShadowDisplayWidth.value);
</script>

<template>
  <DungeonsUIBarImage
    v-model:display-width="leftCapShadowDisplayWidth"
    :image-position
    :texture="ImageKey.BarLeftCapShadow"
    :scale-y
  />
  <DungeonsUIBarImage
    :image-position="{ ...imagePosition, x: middleShadowX }"
    :display-width="middleShadowDisplayWidth"
    :texture="ImageKey.BarMiddleShadow"
    :scale-y
  />
  <DungeonsUIBarImage
    v-model:display-width="rightCapShadowDisplayWidth"
    :image-position="{ ...imagePosition, x: rightCapShadowX }"
    :texture="ImageKey.BarRightCapShadow"
    :scale-y
  />
</template>
