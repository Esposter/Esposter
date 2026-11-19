<script setup lang="ts">
import type { PopupProps } from "#src/components/Clicker/Model/Points/PopupProps";

import { formatNumberLong } from "#src/services/clicker/formatNumberLong";
import { useClickerStore } from "#src/store/clicker/index";

const { durationMs, left, points, top } = defineProps<PopupProps>();
const clickerStore = useClickerStore();
const { clickerItemProperties } = storeToRefs(clickerStore);
const color = computed(() => clickerItemProperties.value.color);
const displayPoints = computed(() => formatNumberLong(points));
const animationDuration = computed(() => `${durationMs}ms`);
const leftPx = computed(() => `${left}px`);
const topPx = computed(() => `${top}px`);
</script>

<template>
  <div class="popup" pointer-events-none select-none absolute ui-title>+{{ displayPoints }}</div>
</template>

<style scoped>
@keyframes animation {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
    transform: translateY(-15.625rem);
  }
}

.popup {
  top: v-bind(topPx);
  left: v-bind(leftPx);
  color: v-bind(color);
  animation: animation v-bind(animationDuration) forwards;
}
</style>
