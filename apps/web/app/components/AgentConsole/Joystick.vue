<script setup lang="ts">
import type { Vector2Like } from "three";
// Where the thumb is from the joystick's middle, as a share of its reach: x rightward, y forward
const direction = defineModel<Vector2Like>({ required: true });
// eslint-disable-next-line no-restricted-syntax -- a DOM element: only the vector's type comes from `three`
const base = useTemplateRef("base");
const pointerId = ref<number>();
const knobTransform = computed(() => `translate(${direction.value.x * 50}%, ${-direction.value.y * 50}%)`);
const move = (event: PointerEvent) => {
  if (!base.value || event.pointerId !== pointerId.value) return;
  const { height, left, top, width } = base.value.getBoundingClientRect();
  const x = ((event.clientX - left) / width) * 2 - 1;
  const y = 1 - ((event.clientY - top) / height) * 2;
  const length = Math.hypot(x, y);
  direction.value = length > 1 ? { x: x / length, y: y / length } : { x, y };
};
const release = (event: PointerEvent) => {
  if (event.pointerId !== pointerId.value) return;
  pointerId.value = undefined;
  direction.value = { x: 0, y: 0 };
};
</script>

<template>
  <!-- A touch control only: every place it walks to is reachable from the console, so it is hidden from assistive
    Technology rather than offered as a second, lesser way -->
  <div
    ref="base"
    aria-hidden="true"
    bg="panel/60"
    rd-full
    size-32
    relative
    touch-none
    @lostpointercapture="(event: PointerEvent) => release(event)"
    @pointercancel="(event: PointerEvent) => release(event)"
    @pointerdown="
      (event: PointerEvent) => {
        pointerId = event.pointerId;
        base?.setPointerCapture(event.pointerId);
        move(event);
      }
    "
    @pointermove="(event: PointerEvent) => move(event)"
    @pointerup="(event: PointerEvent) => release(event)"
  >
    <div m-a rd-full size-12 inset-0 absolute ui-raised :style="{ transform: knobTransform }" />
  </div>
</template>
