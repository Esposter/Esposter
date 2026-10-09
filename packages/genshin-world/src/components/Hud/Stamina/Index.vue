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
  <!-- The party's stamina, an arc round the character's right wherever it stands on the screen, filled from its foot:
       Shown while the pool is spent or refilling, faded out once it is full, and flashing once it runs low. The arc is
       Drawn round the pivot itself, its view's origin, so it rings the character as the game's does -->
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
    <svg viewBox="89 -52 20 104" aria-hidden="true">
      <path class="track" d="M 93 47.6 A 104.5 104.5 0 0 0 93 -47.6" />
      <path
        class="fill"
        d="M 93 47.6 A 104.5 104.5 0 0 0 93 -47.6"
        pathLength="1"
        :stroke-dasharray="`${frame.stamina / maxStamina} 1`"
      />
    </svg>
  </div>
</template>

<style scoped>
/* The arc as `hud-stamina-climb` shows it on the English PC client at 1080 high, its centreline fitted to a circle of
   Radius 104.5 from 27.1 degrees above its centre to 27.1 below, 7 wide, its view's origin that circle's centre, which
   Falls on the character. Provisional: that centre being the pivot, the flash and the fade, read off a recording of the
   Meter refilling until it fades */
.stamina-meter {
  position: absolute;
  top: 0;
  left: 0;
  width: calc(var(--unit) * 20);
  height: calc(var(--unit) * 104);
  opacity: 0;
  transition: opacity 300ms ease-out;
  translate: calc(var(--pivot-x) * 100cqw + var(--unit) * 89) calc(var(--pivot-y) * 100cqh - var(--unit) * 52);
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
  stroke-width: 7;
}

/* The drained part a dark red at 0.55, fitted to the track over the white rock, the grass and the sky it crosses, and
   The fill the yellow of its core's 144 pixels on the same frame */
.track {
  stroke: rgb(86 8 0 / 0.55);
}

.fill {
  stroke: #eec20b;
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
