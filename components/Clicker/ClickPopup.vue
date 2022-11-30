<script setup lang="ts">
interface ClickPopupProps {
  points: number;
  clientX: number;
  clientY: number;
  duration: number;
}

const props = defineProps<ClickPopupProps>();
const { points, clientX, clientY, duration } = $(toRefs(props));
const { primary } = useColors();
const clientXPx = $computed(() => `${clientX}px`);
const clientYPx = $computed(() => `${clientY}px`);
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
  top: v-bind(clientYPx);
  left: v-bind(clientXPx);
  color: v-bind(primary);
  animation: animation v-bind(durationMs) forwards;
}
</style>
