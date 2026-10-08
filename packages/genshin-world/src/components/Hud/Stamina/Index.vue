<script setup lang="ts">
import type { HudFrame } from "#src/models/hud/HudFrame";
import type { GameText } from "genshin-text";

import { STAMINA_METER_LOW_SHARE } from "#src/services/hud/constants";
import { GameTextKey } from "genshin-text";

interface Props {
  // The world's frame, whose stamina the meter fills by and whose pivot it stands beside
  frame: HudFrame;
  // The game's words in the reader's language
  gameText: GameText;
  maxStamina: number;
}

const { frame, gameText, maxStamina } = defineProps<Props>();
</script>

<template>
  <!-- The party's stamina, a curved bar beside the character wherever it stands on the screen, filled from its foot:
       Shown while the pool is spent or refilling, faded out once it is full, and flashing once it runs low -->
  <div
    class="stamina-meter"
    :class="{ low: frame.stamina < maxStamina * STAMINA_METER_LOW_SHARE, shown: frame.stamina < maxStamina }"
    :aria-label="gameText[GameTextKey.Stamina]"
    :aria-valuemax="maxStamina"
    aria-valuemin="0"
    :aria-valuenow="Math.round(frame.stamina)"
    role="meter"
    :style="{ '--pivot-x': frame.pivotX, '--pivot-y': frame.pivotY }"
  >
    <svg viewBox="0 0 32 120" aria-hidden="true">
      <path class="track" d="M 4 116 A 80 80 0 0 0 4 4" />
      <path
        class="fill"
        d="M 4 116 A 80 80 0 0 0 4 4"
        pathLength="1"
        :stroke-dasharray="`${frame.stamina / maxStamina} 1`"
      />
    </svg>
  </div>
</template>

<style scoped>
/* Provisional: the meter's place beside the pivot, its size, arc, colours, flash and fade, measured off a recording of
   The English PC client's meter draining and refilling */
.stamina-meter {
  position: absolute;
  top: 0;
  left: 0;
  width: calc(var(--unit) * 32);
  height: calc(var(--unit) * 120);
  opacity: 0;
  transition: opacity 300ms ease-out;
  translate: calc(var(--pivot-x) * 100cqw + var(--unit) * 64) calc(var(--pivot-y) * 100cqh - 50%);
}

.shown {
  opacity: 1;
  transition-duration: 100ms;
}

.stamina-meter svg {
  display: block;
  width: 100%;
  height: 100%;
  fill: none;
  stroke-width: 6;
}

.track {
  stroke: rgb(0 0 0 / 0.35);
}

.fill {
  stroke: #ffd43b;
}

.low .fill {
  animation: flash 400ms ease-in-out infinite alternate;
  stroke: #ff5a4f;
}

@keyframes flash {
  to {
    opacity: 0.3;
  }
}
</style>
