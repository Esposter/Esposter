<script setup lang="ts">
import { ElementTypes } from "#src/models/interface/ElementType";
import { ElementMarkPathMap } from "#src/services/interface/ElementMarkPathMap";
import { MARKS_FADE_MS, WHITE_HOLD_MS } from "#src/services/interface/loading/constants";
import { useTimeoutFn, whenever } from "@vueuse/core";

interface Props {
  // How far loading has gone, from 0 to 1
  progress: number;
}

const { progress } = defineProps<Props>();
const emit = defineEmits<{ finish: [] }>();
// The game's startup screen: the seven marks in a row on white, pale until loading reaches them, then darkened by a
// Wipe from the left that jumps as loading does, with no easing. The lit row is the pale one again, clipped to what
// Has loaded. Once loading completes the marks fade out, the white holds, and `finish` says the world may cut in
const litInset = computed(() => `inset(0 ${(1 - Math.min(Math.max(progress, 0), 1)) * 100}% 0 0)`);
const isComplete = computed(() => progress >= 1);
const { start } = useTimeoutFn(() => emit("finish"), MARKS_FADE_MS + WHITE_HOLD_MS, { immediate: false });
whenever(isComplete, start, { once: true });
</script>

<template>
  <div
    class="startup-loading"
    role="progressbar"
    aria-label="Loading"
    aria-valuemin="0"
    aria-valuemax="100"
    :aria-valuenow="Math.round(progress * 100)"
  >
    <div
      v-for="isLit of [false, true]"
      :key="String(isLit)"
      :class="['marks', { complete: isComplete, lit: isLit }]"
      :style="isLit ? { clipPath: litInset } : undefined"
    >
      <svg
        v-for="elementType of ElementTypes"
        :key="elementType"
        class="mark"
        viewBox="0 0 1600 1600"
        aria-hidden="true"
      >
        <path :d="ElementMarkPathMap[elementType]" />
      </svg>
    </div>
  </div>
</template>

<style scoped>
/* Laid out on the game's 1080-unit-high screen, which scales with the height as the game's interface does */
.startup-loading {
  position: absolute;
  inset: 0;
  container-type: size;
  background: #fff;
}

/* The row is as wide as its marks, so the lit row's clip is a share of the row rather than of the screen */
.marks {
  --unit: calc(100cqh / 1080);
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  gap: calc(var(--unit) * 4.875);
  translate: -50% -50%;
}

.complete {
  opacity: 0;
  transition: opacity calc(v-bind(MARKS_FADE_MS) * 1ms) linear;
}

.mark {
  width: calc(var(--unit) * 72);
  height: calc(var(--unit) * 72);
  fill: #f4f4f4;
}

.lit .mark {
  fill: #666;
}
</style>
