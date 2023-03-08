<script setup lang="ts">
import { formatNumberLong } from "@/services/clicker/format";

export interface PointsPopupProps {
  points: number;
  top: number;
  left: number;
  duration: number;
}

const props = defineProps<PointsPopupProps>();
const { points, top, left, duration } = toRefs(props);
const { primary } = useColors();
const displayPoints = computed(() => formatNumberLong(points.value));
const topPx = computed(() => `${top.value}px`);
const leftPx = computed(() => `${left.value}px`);
const durationMs = computed(() => `${duration.value}ms`);
</script>

<template>
  <div class="text-h5 popup" position="absolute" font="bold" select="none" pointer-events="none">
    +{{ displayPoints }}
  </div>
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
