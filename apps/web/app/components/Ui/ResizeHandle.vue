<script setup lang="ts">
import { RESIZE_HANDLE_KEYBOARD_STEP } from "@/services/ui/constants";

interface Props {
  // Sits on the pane's start edge and grows it as the pointer moves toward the start, as a right sidebar's handle does
  isReversed?: true;
  // The pane it sizes, which names the separator: "Resize rooms"
  label: string;
  max: number;
  min: number;
}

// The WAI-ARIA window splitter: a separator one stop in the tab order that says the pane's width and its range, dragged
// By the pointer, stepped by the arrows and sent to either end by Home and End. A line on the pane's edge that takes the
// Accent while it is pointed at, focused or dragged, over a wider strip that is easier to catch
const width = defineModel<number>({ required: true });
const { isReversed, label, max, min } = defineProps<Props>();
// The pointer dragging, so a second touch on the handle neither restarts the drag nor moves or ends it
const dragPointerId = ref<number>();
const isDragging = computed(() => dragPointerId.value !== undefined);
// Where the drag began, read on every move so the width follows the pointer rather than accumulating rounding
const dragStart = { width: 0, x: 0 };
// A template cannot see a language global, so the element's type is checked here
const startDrag = (event: PointerEvent) => {
  // A drag would otherwise also sweep a text selection across the pane
  event.preventDefault();
  if (isDragging.value) return;
  if (event.currentTarget instanceof HTMLElement) event.currentTarget.setPointerCapture(event.pointerId);
  dragPointerId.value = event.pointerId;
  dragStart.x = event.clientX;
  dragStart.width = width.value;
};
const endDrag = (event: PointerEvent) => {
  if (event.pointerId === dragPointerId.value) dragPointerId.value = undefined;
};
const clamp = (value: number) => Math.min(Math.max(value, min), max);
const getNextWidth = (event: KeyboardEvent) => {
  const direction = isReversed ? -1 : 1;
  switch (event.key) {
    case "ArrowLeft":
      return width.value - direction * RESIZE_HANDLE_KEYBOARD_STEP;
    case "ArrowRight":
      return width.value + direction * RESIZE_HANDLE_KEYBOARD_STEP;
    case "End":
      return max;
    case "Home":
      return min;
    default:
      return undefined;
  }
};
</script>

<template>
  <div
    :aria-label="label"
    :aria-valuemax="max"
    :aria-valuemin="min"
    :aria-valuenow="width"
    aria-orientation="vertical"
    class="handle"
    :class="isReversed ? 'left-0 -translate-x-1/2' : 'right-0 translate-x-1/2'"
    :data-dragging="isDragging || undefined"
    role="separator"
    tabindex="0"
    w-2
    cursor-col-resize
    inset-y-0
    absolute
    z-10
    touch-none
    focus-visible:outline-hidden
    @keydown="
      (event: KeyboardEvent) => {
        const nextWidth = getNextWidth(event);
        if (nextWidth === undefined) return;
        event.preventDefault();
        width = clamp(nextWidth);
      }
    "
    @pointercancel="endDrag($event)"
    @pointerdown="startDrag($event)"
    @pointermove="
      (event: PointerEvent) => {
        if (event.pointerId !== dragPointerId) return;
        const delta = event.clientX - dragStart.x;
        width = clamp(dragStart.width + (isReversed ? -delta : delta));
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
</style>
