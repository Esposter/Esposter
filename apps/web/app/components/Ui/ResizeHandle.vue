<script setup lang="ts">
import { RESIZE_HANDLE_KEYBOARD_STEP } from "@/services/ui/constants";

interface Props {
  // Sits on the pane's start edge and grows it as the pointer moves toward the start, as a right sidebar's handle does,
  // Or a bottom sheet's on its top edge
  isReversed?: true;
  // Sizes the pane's height from its top or bottom edge, rather than its width from a side
  isVertical?: true;
  // The pane it sizes, which names the separator: "Resize rooms"
  label: string;
  max: number;
  min: number;
}
// The WAI-ARIA window splitter: a separator one stop in the tab order that says the pane's size and its range, dragged
// By the pointer, stepped by the arrows and sent to either end by Home and End. A line on the pane's edge that takes
// The accent while it is pointed at, focused or dragged, over a wider strip that is easier to catch
const size = defineModel<number>({ required: true });
const { isReversed, isVertical, label, max, min } = defineProps<Props>();
// The pointer dragging, so a second touch on the handle neither restarts the drag nor moves or ends it
const dragPointerId = ref<number>();
const isDragging = computed(() => dragPointerId.value !== undefined);
// Where the drag began, read on every move so the size follows the pointer rather than accumulating rounding
const dragStart = { position: 0, size: 0 };
const readPosition = (event: PointerEvent) => (isVertical ? event.clientY : event.clientX);
// A template cannot see a language global, so the element's type is checked here
const startDrag = (event: PointerEvent) => {
  // A drag would otherwise also sweep a text selection across the pane
  event.preventDefault();
  if (isDragging.value) return;
  if (event.currentTarget instanceof HTMLElement) event.currentTarget.setPointerCapture(event.pointerId);
  dragPointerId.value = event.pointerId;
  dragStart.position = readPosition(event);
  dragStart.size = size.value;
};
const endDrag = (event: PointerEvent) => {
  if (event.pointerId === dragPointerId.value) dragPointerId.value = undefined;
};
const clamp = (value: number) => Math.min(Math.max(value, min), max);
const getNextSize = (event: KeyboardEvent) => {
  const direction = isReversed ? -1 : 1;
  switch (event.key) {
    case "End":
      return max;
    case "Home":
      return min;
    case isVertical ? "ArrowDown" : "ArrowRight":
      return size.value + direction * RESIZE_HANDLE_KEYBOARD_STEP;
    case isVertical ? "ArrowUp" : "ArrowLeft":
      return size.value - direction * RESIZE_HANDLE_KEYBOARD_STEP;
    default:
      return undefined;
  }
};
</script>

<template>
  <!-- A separator between panes stacked one over the other lies across them, so a height's handle is horizontal -->
  <div
    :aria-label="label"
    :aria-valuemax="max"
    :aria-valuemin="min"
    :aria-valuenow="size"
    :aria-orientation="isVertical ? 'horizontal' : 'vertical'"
    class="handle"
    :class="[
      isVertical ? 'h-2 cursor-row-resize inset-x-0' : 'w-2 cursor-col-resize inset-y-0',
      isVertical
        ? isReversed
          ? 'top-0 -translate-y-1/2'
          : 'bottom-0 translate-y-1/2'
        : isReversed
          ? 'left-0 -translate-x-1/2'
          : 'right-0 translate-x-1/2',
    ]"
    :data-dragging="isDragging || undefined"
    :data-vertical="isVertical || undefined"
    role="separator"
    tabindex="0"
    absolute
    z-10
    touch-none
    focus-visible:outline-hidden
    @keydown="
      (event: KeyboardEvent) => {
        const nextSize = getNextSize(event);
        if (nextSize === undefined) return;
        event.preventDefault();
        size = clamp(nextSize);
      }
    "
    @pointercancel="endDrag($event)"
    @pointerdown="startDrag($event)"
    @pointermove="
      (event: PointerEvent) => {
        if (event.pointerId !== dragPointerId) return;
        const delta = readPosition(event) - dragStart.position;
        // A pointer's position can be fractional, and a saved size is a whole pixel count
        size = clamp(Math.round(dragStart.size + (isReversed ? -delta : delta)));
      }
    "
    @pointerup="endDrag($event)"
  />
</template>

<style scoped>
.handle::before {
  background-color: var(--ui-divider);
  content: "";
  inset-block: 0;
  left: 50%;
  position: absolute;
  transform: translateX(-50%);
  transition:
    background-color var(--ui-motion-short),
    width var(--ui-motion-short);
  width: var(--ui-border-width);
}

.handle:hover::before,
.handle:focus-visible::before,
.handle[data-dragging]::before {
  background-color: var(--ui-accent);
  width: calc(var(--ui-step) / 2);
}

.handle[data-vertical]::before {
  height: var(--ui-border-width);
  inset-block: auto;
  inset-inline: 0;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  transition:
    background-color var(--ui-motion-short),
    height var(--ui-motion-short);
  width: auto;
}

.handle[data-vertical]:hover::before,
.handle[data-vertical]:focus-visible::before,
.handle[data-vertical][data-dragging]::before {
  height: calc(var(--ui-step) / 2);
  width: auto;
}
</style>
