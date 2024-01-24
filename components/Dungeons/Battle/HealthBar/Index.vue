<script setup lang="ts">
import { type Position } from "grid-engine";

interface HealthBarProps {
  position: Position;
}

const { position } = defineProps<HealthBarProps>();
const leftCapDisplayWidth = ref<number>();
const middleX = computed(() => position.x + (leftCapDisplayWidth.value ?? 0));
const middleDisplayWidth = 360;
const scaleY = 0.7;
const rightCapX = computed(() => middleX.value + middleDisplayWidth);
</script>

<template>
  <DungeonsBattleHealthBarLeftCap v-model:displayWidth="leftCapDisplayWidth" :position="position" :scale-y="scaleY" />
  <DungeonsBattleHealthBarMiddle
    :position="{ ...position, x: middleX }"
    :scale-y="scaleY"
    :display-width="middleDisplayWidth"
  />
  <DungeonsBattleHealthBarRightCap :position="{ ...position, x: rightCapX }" :scale-y="scaleY" />
</template>
