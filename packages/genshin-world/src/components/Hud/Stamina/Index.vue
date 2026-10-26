<script setup lang="ts">
import type { HudFrame } from "#src/models/hud/HudFrame";
import type { GameText } from "genshin-text";

import { STAMINA_METER_LOW_SHARE, STAMINA_METER_SECTION } from "#src/services/hud/constants";
import { GameTextKey } from "genshin-text";

interface Props {
  // The world's frame, whose stamina the meter fills by and whose pivot it stands beside
  frame: HudFrame;
  // The game's words in the reader's language
  gameText: GameText;
  // The party's stamina pool, the meter's whole arc
  maxStamina: number;
}

const { frame, gameText, maxStamina } = defineProps<Props>();
// Each cut between the pool's sections as the angle of the arc it stands at, the arc running from its foot at 27.1
// Degrees below its centre to its head at 27.1 above
const sectionAngles = computed(() =>
  Array.from(
    { length: Math.ceil(maxStamina / STAMINA_METER_SECTION) - 1 },
    (_value, index) => 27.1 - (54.2 * (index + 1) * STAMINA_METER_SECTION) / maxStamina,
  ),
);
</script>

<template>
  <!-- The party's stamina, an arc round the character's right wherever it stands on the screen, filled from its foot:
       Shown while the pool is spent or refilling, faded out once it is full, and pulsing red once it runs low. The arc is
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
      <line
        v-for="angle of sectionAngles"
        :key="angle"
        class="section"
        x1="101"
        x2="108"
        y1="0"
        y2="0"
        :transform="`rotate(${angle})`"
      />
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
   Falls on the character. It fades in over 100 ms and out over 200 ms, as the same recording shows it appear at 1.9
   Seconds and fade, evenly, at 7.7. Provisional: that centre being the pivot */
.stamina-meter {
  position: absolute;
  top: 0;
  left: 0;
  width: calc(var(--unit) * 20);
  height: calc(var(--unit) * 104);
  opacity: 0;
  transition: opacity 200ms linear;
  translate: calc(var(--pivot-x) * 100cqw + var(--unit) * 89.5) calc(var(--pivot-y) * 100cqh - var(--unit) * 52);
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

/* The drained part a dark red at 0.38, solved on `hud-stamina-climb`'s sky: the reference's track under our track's mask
   reads (141, 119, 119) where ours reads (125, 89, 91) at 0.55 over the sky's (174, 186, 198). The fill the yellow of its
   core's 144 pixels on the same frame */
.track {
  stroke: rgb(86 8 0 / 0.38);
}

/* The cuts between the sections a white at a quarter across the track, under the fill, as the climb shows them on the
   Track at 0.464 and 0.936 of a pool of about 214 at 30 seconds and the fill unbroken across the first at 22 */
.section {
  stroke: rgb(255 255 255 / 0.25);
  stroke-width: 1.5;
}

.fill {
  stroke: #eec20b;
}

/* Run low, the fill refills red and the track pulses a red #a8362a, glowing toward the character, every two thirds of a
   Second, as the same recording shows the meter from the pool running out at 33 seconds: the pulse at its height at
   33.27 and 33.93 and at its trough at 33.6. Provisional: the share it starts pulsing under, the glow's spread and the
   Fill's red, the frames showing it only from empty */
.low .fill {
  stroke: #ff5a4f;
}

.low svg {
  overflow: visible;
  animation: glow 333ms ease-in-out infinite alternate;
}

.low .track {
  animation: pulse 333ms ease-in-out infinite alternate;
}

@keyframes glow {
  to {
    filter: drop-shadow(calc(var(--unit) * -6) 0 calc(var(--unit) * 8) rgb(255 60 50 / 0.8));
  }
}

@keyframes pulse {
  to {
    stroke: #a8362a;
  }
}
</style>
