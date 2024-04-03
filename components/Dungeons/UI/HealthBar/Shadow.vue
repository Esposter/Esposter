<script setup lang="ts">
import type { ImagePosition } from "@/components/Dungeons/UI/HealthBar/Container.vue";

interface ShadowProps {
  imagePosition: ImagePosition;
  width: number;
  scaleY: number;
}

const { imagePosition, width, scaleY } = defineProps<ShadowProps>();
const leftCapShadowDisplayWidth = ref<number>();
const middleShadowX = computed(() => imagePosition.x + (leftCapShadowDisplayWidth.value ?? 0));
const rightCapShadowX = computed(() => middleShadowX.value + width);
</script>

<template>
  <DungeonsUIHealthBarLeftCapShadow
    v-model:display-width="leftCapShadowDisplayWidth"
    :image-position="imagePosition"
    :scale-y="scaleY"
  />
  <DungeonsUIHealthBarMiddleShadow
    :image-position="{ ...imagePosition, x: middleShadowX }"
    :scale-y="scaleY"
    :display-width="width"
  />
  <DungeonsUIHealthBarRightCapShadow :image-position="{ ...imagePosition, x: rightCapShadowX }" :scale-y="scaleY" />
</template>
