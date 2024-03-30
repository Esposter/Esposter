<script setup lang="ts">
import type { Position } from "grid-engine";

interface ShadowProps {
  position: Position;
  width: number;
  scaleY: number;
}

const { position, width, scaleY } = defineProps<ShadowProps>();
const leftCapShadowDisplayWidth = ref<number>();
const middleShadowX = computed(() => position.x + (leftCapShadowDisplayWidth.value ?? 0));
const rightCapShadowX = computed(() => middleShadowX.value + width);
</script>

<template>
  <DungeonsUIHealthBarLeftCapShadow
    v-model:display-width="leftCapShadowDisplayWidth"
    :position="position"
    :scale-y="scaleY"
  />
  <DungeonsUIHealthBarMiddleShadow
    :position="{ ...position, x: middleShadowX }"
    :scale-y="scaleY"
    :display-width="width"
  />
  <DungeonsUIHealthBarRightCapShadow :position="{ ...position, x: rightCapShadowX }" :scale-y="scaleY" />
</template>
