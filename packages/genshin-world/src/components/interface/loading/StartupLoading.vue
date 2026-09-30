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
// Has loaded. The marks fade in as it starts; once loading completes they fade out, the white holds, and `finish` says
// The world may cut in
const litInset = computed(() => `inset(0 ${(1 - Math.min(Math.max(progress, 0), 1)) * 100}% 0 0)`);
// Loading counts as complete only once the marks have faded in, so a page that finished loading while the splashes
// Played still shows its row, lit, before it goes, as the game's always does
const isFadedIn = ref(false);
const isComplete = computed(() => isFadedIn.value && progress >= 1);
const { start } = useTimeoutFn(() => emit("finish"), MARKS_FADE_MS + WHITE_HOLD_MS, { immediate: false });
whenever(isComplete, start, { immediate: true, once: true });
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
      @animationend="isFadedIn = true"
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
/* Laid out on the game's 1920 by 1080 unit screen, scaled to fit the window's height or its width, whichever is less, as the game's interface is */
.startup-loading {
  position: absolute;
  inset: 0;
  container-type: size;
  background: #fff;
}

/* The row is as wide as its marks, so the lit row's clip is a share of the row rather than of the screen */
.marks {
  --unit: min(100cqh / 1080, 100cqw / 1920);
  position: absolute;
  top: 50%;
  left: 50%;
  display: flex;
  gap: calc(var(--unit) * 4.875);
  translate: -50% -50%;
  /* The marks fade in as the screen starts, and out once loading completes */
  animation: marks-fade-in calc(v-bind(MARKS_FADE_MS) * 1ms) linear;
}

.complete {
  opacity: 0;
  transition: opacity calc(v-bind(MARKS_FADE_MS) * 1ms) linear;
}

@keyframes marks-fade-in {
  from {
    opacity: 0;
  }
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
