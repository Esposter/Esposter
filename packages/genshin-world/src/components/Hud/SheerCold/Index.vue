<script setup lang="ts">
import type { HudFrame } from "#src/models/hud/HudFrame";
import type { GameText } from "genshin-text";

import { SHEER_COLD_MAXIMUM } from "#src/services/sheerCold/constants";
import { GameTextKey } from "genshin-text";

interface Props {
  // The game's words in the reader's language, which name the gauge
  gameText: GameText;
  // The world's frame, whose Sheer Cold gauge the bar fills by
  frame: HudFrame;
}

const { frame, gameText } = defineProps<Props>();
</script>

<template>
  <!-- The Sheer Cold gauge across the screen's top: shown while the gauge holds any cold, faded out where it stands empty,
       and filled from its left. It shows no words; its name reaches assistive technology as its label. Provisional: its
       placement and colours are not read off a recording -->
  <div
    class="sheer-cold"
    :class="{ shown: frame.sheerCold > 0 }"
    :aria-hidden="frame.sheerCold === 0"
    :aria-label="gameText[GameTextKey.SheerCold]"
    :aria-valuemax="SHEER_COLD_MAXIMUM"
    :aria-valuemin="0"
    :aria-valuenow="frame.sheerCold"
    role="meter"
  >
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
