<script setup lang="ts">
import { formatNumberLong } from "@/services/clicker/format";

export interface PointsPopupProps {
  points: number;
  top: number;
  left: number;
  duration: number;
}

const { points, top, left, duration } = defineProps<PointsPopupProps>();
const { primary } = useColors();
const displayPoints = computed(() => formatNumberLong(points));
const topPx = computed(() => `${top}px`);
const leftPx = computed(() => `${left}px`);
const durationMs = computed(() => `${duration}ms`);
</script>

<template>
  <div class="text-h5 popup" absolute font-bold select="none" pointer-events="none">+{{ displayPoints }}</div>
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
  color: v-bind(primary);
  animation: animation v-bind(durationMs) forwards;
}
</style>
