<script setup lang="ts">
interface StyledResizeHandleProps {
  // Reversed handles sit on the left edge and grow their container as the pointer moves left
  isReversed?: boolean;
  max: number;
  min: number;
}

const width = defineModel<number>({ required: true });
const { isReversed = false, max, min } = defineProps<StyledResizeHandleProps>();
const isDragging = ref(false);
const startX = ref(0);
const startWidth = ref(0);
const onPointerDown = (event: PointerEvent) => {
  if (!(event.currentTarget instanceof HTMLElement)) return;
  event.currentTarget.setPointerCapture(event.pointerId);
  isDragging.value = true;
  startX.value = event.clientX;
  startWidth.value = width.value;
};
const onPointerMove = (event: PointerEvent) => {
  if (!isDragging.value) return;
  const delta = event.clientX - startX.value;
  width.value = Math.min(Math.max(startWidth.value + (isReversed ? -delta : delta), min), max);
};
const onPointerUp = () => {
  isDragging.value = false;
};
</script>

<template>
  <div
    w-1
    cursor-col-resize
    inset-y-0
    absolute
    z-10
    class="resize-handle"
    :class="[isReversed ? 'left-0' : 'right-0', { 'resize-handle--dragging': isDragging }]"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
  />
</template>

<style scoped>
.resize-handle {
  touch-action: none;
  transition: background-color 0.2s;
}

.resize-handle:hover,
.resize-handle--dragging {
  background-color: rgb(var(--v-theme-primary));
}
</style>
