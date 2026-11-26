<script setup lang="ts">
import type { Input } from "genshin-engine";

import { TOUCH_LOOK_RADIANS_PER_PIXEL } from "#src/services/hud/constants";
import { useEventListener } from "@vueuse/core";

interface Props {
  input: Input;
}

const { input } = defineProps<Props>();
const layer = useTemplateRef("layer");
let isDragging = false;
let dragPointerId = 0;
let dragX = 0;
let dragY = 0;
// A finger landing on the screen's right half, where no HUD piece takes it, drags the look, one finger at a time
useEventListener(layer, "pointerdown", (event) => {
  if (isDragging) return;
  isDragging = true;
  dragPointerId = event.pointerId;
  dragX = event.clientX;
  dragY = event.clientY;
});
useEventListener(layer, "pointermove", (event) => {
  if (!isDragging || event.pointerId !== dragPointerId) return;
  input.turn(
    -(event.clientX - dragX) * TOUCH_LOOK_RADIANS_PER_PIXEL,
    -(event.clientY - dragY) * TOUCH_LOOK_RADIANS_PER_PIXEL,
  );
  dragX = event.clientX;
  dragY = event.clientY;
});
useEventListener(layer, ["pointerup", "pointercancel"], (event) => {
  if (event.pointerId === dragPointerId) isDragging = false;
});
</script>

<template>
  <!-- The touch layout's look under every piece of the HUD on the screen's right half, the left half being the stick's:
       A drag there turns the look, as the game's touch controls do outside the stick's area -->
  <div ref="layer" class="touch-layer" />
</template>

<style scoped>
.touch-layer {
  position: absolute;
  inset: 0 0 0 50%;
  pointer-events: auto;
  touch-action: none;
}
</style>
