<script setup lang="ts">
import { formatNumberLong } from "@/services/clicker/format";
import { useClickerStore } from "@/store/clicker";

export interface PointsPopupProps {
  duration: number;
  left: number;
  points: number;
  top: number;
}

const { duration, left, points, top } = defineProps<PointsPopupProps>();
const clickerStore = useClickerStore();
const { clickerItemProperties } = storeToRefs(clickerStore);
const color = computed(() => clickerItemProperties.value.color);
const displayPoints = computed(() => formatNumberLong(points));
const durationMs = computed(() => `${duration}ms`);
const leftPx = computed(() => `${left}px`);
const topPx = computed(() => `${top}px`);
</script>

<template>
  <div class="popup" font-bold pointer-events-none select-none absolute text-headline-small>+{{ displayPoints }}</div>
</template>

<style scoped>
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
