<script setup lang="ts">
import { formatNumberLong } from "@/services/clicker/format";

export interface PointsPopupProps {
  duration: number;
  left: number;
  points: number;
  top: number;
}

const { duration, left, points, top } = defineProps<PointsPopupProps>();
const clickerItemProperties = useClickerItemProperties();
const color = computed(() => clickerItemProperties.value.color);
const displayPoints = computed(() => formatNumberLong(points));
const topPx = computed(() => `${top}px`);
const leftPx = computed(() => `${left}px`);
const durationMs = computed(() => `${duration}ms`);
</script>

<template>
  <div class="text-h5 popup" font-bold select-none absolute pointer-events-none>+{{ displayPoints }}</div>
</template>

<style scoped lang="scss">
@keyframes animation {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-250px);
  }
}

.popup {
  top: v-bind(topPx);
  left: v-bind(leftPx);
  color: v-bind(color);
  animation: animation v-bind(durationMs) forwards;
}
</style>
