<script setup lang="ts">
export interface ClickPopupProps {
  points: number;
  top: number;
  left: number;
  duration: number;
}

const props = defineProps<ClickPopupProps>();
const { points, top, left, duration } = $(toRefs(props));
const { primary } = useColors();
const topPx = $computed(() => `${top}px`);
const leftPx = $computed(() => `${left}px`);
const durationMs = $computed(() => `${duration}ms`);
</script>

<template>
  <div class="text-h5 popup" position="absolute" font="bold" select="none" pointer-events="none">+{{ points }}</div>
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
