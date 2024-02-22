<script setup lang="ts">
import type { Position } from "grid-engine";

interface ShadowProps {
  position: Position;
}

const { position } = defineProps<ShadowProps>();
const leftCapShadowDisplayWidth = ref<number>();
const middleShadowX = computed(() => position.x + (leftCapShadowDisplayWidth.value ?? 0));
const middleShadowDisplayWidth = 360;
const scaleY = 0.7;
const rightCapShadowX = computed(() => middleShadowX.value + middleShadowDisplayWidth);
</script>

<template>
  <DungeonsBattleHealthBarLeftCapShadow
    v-model:display-width="leftCapShadowDisplayWidth"
    :position="position"
    :scale-y="scaleY"
  />
  <DungeonsBattleHealthBarMiddleShadow
    :position="{ ...position, x: middleShadowX }"
    :scale-y="scaleY"
    :display-width="middleShadowDisplayWidth"
  />
  <DungeonsBattleHealthBarRightCapShadow :position="{ ...position, x: rightCapShadowX }" :scale-y="scaleY" />
</template>
