<script setup lang="ts">
import type { Input } from "genshin-engine";
import type { GameText } from "genshin-text";

import { TOUCH_LOOK_RADIANS_PER_PIXEL, TOUCH_STICK_REACH } from "#src/services/hud/constants";
import { useEventListener } from "@vueuse/core";
import { KEY_CODE_UP } from "genshin-engine";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  input: Input;
}

const { gameText, input } = defineProps<Props>();
const layer = useTemplateRef("layer");
// The stick under the left thumb: where it landed on the layer, and how far it is pushed, each axis from -1 to 1
const stick = reactive({ centreX: 0, centreY: 0, isHeld: false, pointerId: 0, x: 0, y: 0 });
const ringStyle = computed(() => ({ left: `${stick.centreX}px`, top: `${stick.centreY}px` }));
const knobStyle = computed(() => ({ translate: `${stick.x * TOUCH_STICK_REACH}px ${stick.y * TOUCH_STICK_REACH}px` }));
let isDragging = false;
let dragPointerId = 0;
let dragX = 0;
let dragY = 0;
// A thumb landing on the left half holds the stick round where it landed and one on the right half drags the look,
// One thumb each, as the game's touch controls split the screen
useEventListener(layer, "pointerdown", (event) => {
  if (!layer.value) return;
  const { left, top, width } = layer.value.getBoundingClientRect();
  if (event.clientX - left < width / 2) {
    if (stick.isHeld) return;
    stick.centreX = event.clientX - left;
    stick.centreY = event.clientY - top;
    stick.isHeld = true;
    stick.pointerId = event.pointerId;
    stick.x = stick.y = 0;
  } else if (!isDragging) {
    isDragging = true;
    dragPointerId = event.pointerId;
    dragX = event.clientX;
    dragY = event.clientY;
  }
});
useEventListener(layer, "pointermove", (event) => {
  if (!layer.value) return;
  if (stick.isHeld && event.pointerId === stick.pointerId) {
    const { left, top } = layer.value.getBoundingClientRect();
    const offsetX = event.clientX - left - stick.centreX;
    const offsetY = event.clientY - top - stick.centreY;
    // Pushed past its reach, the stick stays at its rim in the thumb's direction
    const reach = Math.max(Math.hypot(offsetX, offsetY), TOUCH_STICK_REACH);
    stick.x = offsetX / reach;
    stick.y = offsetY / reach;
    input.setTouchStick(stick.x, stick.y);
  } else if (isDragging && event.pointerId === dragPointerId) {
    input.turn(
      -(event.clientX - dragX) * TOUCH_LOOK_RADIANS_PER_PIXEL,
      -(event.clientY - dragY) * TOUCH_LOOK_RADIANS_PER_PIXEL,
    );
    dragX = event.clientX;
    dragY = event.clientY;
  }
});
useEventListener(layer, ["pointerup", "pointercancel"], (event) => {
  if (stick.isHeld && event.pointerId === stick.pointerId) {
    stick.isHeld = false;
    input.setTouchStick(0, 0);
  } else if (isDragging && event.pointerId === dragPointerId) isDragging = false;
});
// Hidden with the HUD, the controls let go of whatever they hold
onUnmounted(() => {
  input.setTouchStick(0, 0);
  input.release(KEY_CODE_UP);
});
</script>

<template>
  <!-- The touch controls under the HUD's pieces: the left half a stick that moves, drawn where the thumb landed while
       It is held, the right half a drag that looks, and the jump button at the bottom right -->
  <div ref="layer" class="touch-layer">
    <div v-if="stick.isHeld" class="ring" :style="ringStyle"><div class="knob" :style="knobStyle" /></div>
  </div>
  <button
    class="jump"
    type="button"
    :aria-label="gameText[GameTextKey.Jump]"
    @pointercancel="input.release(KEY_CODE_UP)"
    @pointerdown="input.press(KEY_CODE_UP)"
    @pointerup="input.release(KEY_CODE_UP)"
  />
</template>

<style scoped>
.touch-layer {
  position: absolute;
  inset: 0;
  pointer-events: auto;
  touch-action: none;
}

/* Provisional: the stick's and the jump button's sizes and looks, measured off a recording of the mobile client */
.ring {
  position: absolute;
  display: grid;
  width: calc(v-bind(TOUCH_STICK_REACH) * 2px);
  height: calc(v-bind(TOUCH_STICK_REACH) * 2px);
  border: 2px solid rgb(255 255 255 / 0.5);
  border-radius: 50%;
  pointer-events: none;
  place-items: center;
  translate: -50% -50%;
}

.knob {
  width: 40%;
  height: 40%;
  border-radius: 50%;
  background: rgb(255 255 255 / 0.7);
}

.jump {
  position: absolute;
  right: calc(var(--unit) * 96);
  bottom: calc(var(--unit) * 96);
  width: calc(var(--unit) * 140);
  height: calc(var(--unit) * 140);
  padding: 0;
  border: calc(var(--unit) * 4) solid rgb(255 255 255 / 0.6);
  border-radius: 50%;
  background: rgb(0 0 0 / 0.25);
  cursor: inherit;
  pointer-events: auto;
  touch-action: none;
}
</style>
