<script setup lang="ts">
import type { HudFrame } from "#src/models/hud/HudFrame";

import { SHEER_COLD_MAXIMUM } from "#src/services/sheerCold/constants";

interface Props {
  // The world's frame, whose Sheer Cold gauge the bar fills by
  frame: HudFrame;
}

const { frame } = defineProps<Props>();
</script>

<template>
  <!-- The Sheer Cold gauge across the screen's top: shown while the gauge holds any cold, faded out where it stands empty,
       and filled from its left. It has no words of its own, since the game's name for it is not yet in the reader's text
       Provisional: its placement and colours are not read off a recording -->
  <div aria-hidden="true" class="sheer-cold" :class="{ shown: frame.sheerCold > 0 }">
    <div class="fill" :style="{ width: `${(frame.sheerCold / SHEER_COLD_MAXIMUM) * 100}%` }" />
  </div>
</template>

<style scoped>
.sheer-cold {
  position: absolute;
  top: calc(var(--unit) * 6);
  left: 50%;
  width: calc(var(--unit) * 240);
  height: calc(var(--unit) * 6);
  translate: -50% 0;
  background: rgb(0 0 0 / 0.4);
  opacity: 0;
  transition: opacity 200ms linear;
}

.shown {
  opacity: 1;
}

.fill {
  height: 100%;
  background: #9fd8ff;
}
</style>
