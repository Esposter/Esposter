<script setup lang="ts">
interface Props {
  // The indicator's zones as fractions of its bar from the left end: the Delicious zone lies within the Regular one
  zones: { delicious: [number, number]; regular: [number, number] };
  // The Stop button's label in the reader's language
  stopLabel: string;
  // The place of the pointer along the bar, as a fraction from its left end
  pointer: number;
  // The title the game shows at the top left
  title: string;
}

const { pointer, stopLabel, title, zones } = defineProps<Props>();
const emit = defineEmits<{ close: []; stop: [] }>();

// The bar is the top half of an ellipse on the 1920 by 1080 stage, running from its left end to its right end
const ARC_CENTRE_X = 960;
const ARC_CENTRE_Y = 832;
const ARC_RADIUS_X = 435;
const ARC_RADIUS_Y = 120;
const toArcPoint = (fraction: number) => {
  const angle = Math.PI * (1 - Math.min(1, Math.max(0, fraction)));
  return { x: ARC_CENTRE_X + ARC_RADIUS_X * Math.cos(angle), y: ARC_CENTRE_Y - ARC_RADIUS_Y * Math.sin(angle) };
};
const toBarPath = ([start, end]: [number, number]) => {
  const from = toArcPoint(start);
  const to = toArcPoint(end);
  return `M ${from.x} ${from.y} A ${ARC_RADIUS_X} ${ARC_RADIUS_Y} 0 0 1 ${to.x} ${to.y}`;
};
</script>

<template>
  <div class="cooking-screen">
    <h1 class="title">{{ title }}</h1>
    <button class="close" type="button" @click="emit('close')">×</button>
    <svg aria-hidden="true" class="stage" viewBox="0 0 1920 1080">
      <!-- A provisional pot until the game's own is traced from the recording -->
      <ellipse class="pot-rim" cx="960" cy="330" rx="150" ry="36" />
      <path class="pot" d="M810 330 Q830 470 960 480 Q1090 470 1110 330 Z" />
      <path class="track" :d="toBarPath([0, 1])" />
      <path class="regular" :d="toBarPath(zones.regular)" />
      <path class="delicious" :d="toBarPath(zones.delicious)" />
      <circle class="pointer" :cx="toArcPoint(pointer).x" :cy="toArcPoint(pointer).y" r="16" />
    </svg>
    <button class="stop" type="button" @click="emit('stop')">{{ stopLabel }}</button>
  </div>
</template>

<style scoped>
/* The screen's colours are provisional until the glyph pass reads them from the recording */
.cooking-screen {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background: rgb(20 18 16 / 55%);
}

.stage {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
}

.pot {
  fill: #3a3a44;
}

.pot-rim {
  fill: #4a4a56;
}

.track {
  fill: none;
  stroke: #5b5145;
  stroke-width: 6;
}

.regular {
  fill: none;
  stroke: #e9dcb0;
  stroke-width: 22;
}

.delicious {
  fill: none;
  stroke: #f0a040;
  stroke-width: 22;
}

.pointer {
  fill: #fff8e8;
  stroke: #3a2f22;
  stroke-width: 4;
}

.title {
  position: absolute;
  top: calc(var(--unit) * 32);
  left: calc(var(--unit) * 96);
  margin: 0;
  color: #ece3d8;
  font-size: calc(var(--unit) * 28);
  font-weight: 600;
}

.close {
  position: absolute;
  top: calc(var(--unit) * 32);
  right: calc(var(--unit) * 96);
  width: calc(var(--unit) * 48);
  height: calc(var(--unit) * 48);
  border: 0;
  border-radius: 50%;
  background: rgb(255 255 255 / 20%);
  color: #ece3d8;
  font-size: calc(var(--unit) * 28);
}

.stop {
  position: absolute;
  bottom: calc(var(--unit) * 40);
  left: 50%;
  width: calc(var(--unit) * 140);
  height: calc(var(--unit) * 52);
  transform: translateX(-50%);
  border: 0;
  background: #a154de;
  color: #ece3d8;
  font-size: calc(var(--unit) * 22);
  font-weight: 600;
}
</style>
