<script setup lang="ts">
import type { ImagePosition } from "@/components/Dungeons/UI/Bar/Container.vue";

interface ShadowProps {
  imagePosition: ImagePosition;
  width: number;
  scaleY: number;
}

const { imagePosition, width, scaleY } = defineProps<ShadowProps>();
const leftCapShadowDisplayWidth = ref<number>();
const middleShadowX = computed(() => imagePosition.x + (leftCapShadowDisplayWidth.value ?? 0));
const middleShadowDisplayWidth = computed(
  () => width - ((leftCapShadowDisplayWidth.value ?? 0) + (rightCapShadowDisplayWidth.value ?? 0)),
);
const rightCapShadowDisplayWidth = ref<number>();
const rightCapShadowX = computed(() => middleShadowX.value + middleShadowDisplayWidth.value);
</script>

<template>
  <DungeonsUIBarLeftCapShadow
    v-model:display-width="leftCapShadowDisplayWidth"
    :image-position="imagePosition"
    :scale-y="scaleY"
  />
  <DungeonsUIBarMiddleShadow
    :image-position="{ ...imagePosition, x: middleShadowX }"
    :scale-y="scaleY"
    :display-width="middleShadowDisplayWidth"
  />
  <DungeonsUIBarRightCapShadow
    v-model:display-width="rightCapShadowDisplayWidth"
    :image-position="{ ...imagePosition, x: rightCapShadowX }"
    :scale-y="scaleY"
  />
</template>
