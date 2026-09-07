<script setup lang="ts">
interface Props {
  // Reversed handles sit on the left edge and grow their container as the pointer moves left
  isReversed?: boolean;
  max: number;
  min: number;
}

const width = defineModel<number>({ required: true });
const { isReversed = false, max, min } = defineProps<Props>();
const isDragging = ref(false);
const startX = ref(0);
const startWidth = ref(0);
const clampWidth = (value: number) => Math.min(Math.max(value, min), max);
const onPointerDown = (event: PointerEvent) => {
  if (!(event.currentTarget instanceof HTMLElement)) return;
  // Mouse drags otherwise also start a native text selection sweeping across the sidebar content
  event.preventDefault();
  event.currentTarget.setPointerCapture(event.pointerId);
  isDragging.value = true;
  startX.value = event.clientX;
  startWidth.value = width.value;
};
const onPointerMove = (event: PointerEvent) => {
  if (!isDragging.value) return;
  const delta = event.clientX - startX.value;
  width.value = clampWidth(startWidth.value + (isReversed ? -delta : delta));
};
const onPointerUp = () => {
  isDragging.value = false;
};
// Keyboard nudge for non-pointer users — one step per Arrow press, direction flipped for reversed handles
const WIDTH_KEYBOARD_STEP = 16;
const onKeyDown = (event: KeyboardEvent) => {
  let direction = 0;
  if (event.key === "ArrowLeft") direction = -1;
  else if (event.key === "ArrowRight") direction = 1;
  else return;
  event.preventDefault();
  width.value = clampWidth(width.value + (isReversed ? -direction : direction) * WIDTH_KEYBOARD_STEP);
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
    role="separator"
    tabindex="0"
    aria-orientation="vertical"
    :aria-valuemin="min"
    :aria-valuemax="max"
    :aria-valuenow="width"
    @pointerdown="onPointerDown"
    @pointermove="onPointerMove"
    @pointerup="onPointerUp"
    @pointercancel="onPointerUp"
    @keydown="onKeyDown"
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
