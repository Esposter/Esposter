<script setup lang="ts">
import type { ImagePosition } from "@/models/dungeons/ImagePosition";

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
  <DungeonsUIBarLeftCapShadow v-model:display-width="leftCapShadowDisplayWidth" :image-position :scale-y />
  <DungeonsUIBarMiddleShadow
    :image-position="{ ...imagePosition, x: middleShadowX }"
    :scale-y
    :display-width="middleShadowDisplayWidth"
  />
  <DungeonsUIBarRightCapShadow
    v-model:display-width="rightCapShadowDisplayWidth"
    :image-position="{ ...imagePosition, x: rightCapShadowX }"
    :scale-y
  />
</template>
