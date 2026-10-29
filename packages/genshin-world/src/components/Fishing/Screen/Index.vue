<script setup lang="ts">
import type { FishingZone } from "#src/models/fishing/FishingZone";

import { REEL_BAR_MAX } from "#src/services/fishing/constants";
import { GameScreen } from "genshin-interface";

interface Props {
  // The cast as it stands: the tension held on the bar and the zone it is held in, or none while no line is out
  view?: { tension: number; zone: FishingZone };
}

const { view } = defineProps<Props>();
const percent = (value: number) => `${(value / REEL_BAR_MAX) * 100}%`;
</script>

<template>
  <GameScreen>
    <template v-if="view">
      <div class="fishing-bar">
        <div class="fishing-fill" :style="{ width: percent(view.zone.start) }" />
        <div class="fishing-zone" :style="{ left: percent(view.zone.start), width: percent(view.zone.width) }" />
        <svg class="fishing-tension" :style="{ left: percent(view.tension) }" viewBox="0 0 30 30" aria-hidden="true">
          <path d="M2 14 19 3v24z" />
          <path d="M19 1h11v3H19zM19 26h11v3H19zM20 1h8v28h-8z" />
        </svg>
      </div>
      <div class="fishing-ring" />
      <svg class="fishing-hook" viewBox="0 0 60 72" aria-hidden="true">
        <path
          fill-rule="evenodd"
          d="M6 0h16.5q.75-.25.5 2.5 3.7 2.8 4 9l-4.5 7.5-3.5 2.5v30l2 3v2l4.5 4.5 3 1h5l3-1 3.5-3.5v-2l2-3v-9l-1.5-1.5h-6.5q-1.12-2.67 1.5-2l11-10h1.5q-1.12-2.67 1.5-2 1.25-2.25 2.5.5v26q-2 1-1 5l-3 5-4.5 4.5-5 3h-17l-8.5-7.5-3-5-1-6-1-1v-31l-5-7v-8l3-4v-2.5zm7 6-3 1q-1 6 3 7 3 1 4-1h1v-5q-1-3-5-2z"
        />
      </svg>
    </template>
  </GameScreen>
</template>

<style scoped>
/* The reel's bar in the game's own pixels: the unfilled brown, the yellow fill to the zone, and a pale arrow tip at each end */
.fishing-bar {
  position: absolute;
  top: calc(var(--unit) * 131);
  left: calc(var(--unit) * 718);
  width: calc(var(--unit) * 484);
  height: calc(var(--unit) * 11);
  background: #7a5440;
}

.fishing-bar::before,
.fishing-bar::after {
  position: absolute;
  top: calc(var(--unit) * -2);
  background: #fff7b2;
  content: "";
}

.fishing-bar::before {
  left: calc(var(--unit) * -14);
  width: calc(var(--unit) * 11);
  height: calc(var(--unit) * 14);
  clip-path: polygon(0 50%, 100% 0, 70% 50%, 100% 100%);
}

.fishing-bar::after {
  left: 100%;
  width: calc(var(--unit) * 14);
  height: calc(var(--unit) * 16);
  clip-path: polygon(100% 50%, 0 0, 30% 50%, 0 100%);
}

.fishing-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  background: #ffcc30;
}

/* The zone is a pale-bordered box the bar's height inside, its right end a pointed cap: a pale point over the zone's brown point */
.fishing-zone {
  position: absolute;
  top: calc(var(--unit) * -4.5);
  bottom: calc(var(--unit) * -4.5);
  box-sizing: border-box;
  border: calc(var(--unit) * 4.5) solid #fff7b2;
  background: #906441;
}

.fishing-zone::before,
.fishing-zone::after {
  position: absolute;
  left: calc(100% - var(--unit) * 8);
  clip-path: polygon(0 0, 100% 50%, 0 100%);
  content: "";
}

.fishing-zone::before {
  top: calc(var(--unit) * -7);
  width: calc(var(--unit) * 14);
  height: calc(var(--unit) * 24);
  background: #fff7b2;
}

.fishing-zone::after {
  top: 0;
  width: calc(var(--unit) * 4);
  height: 100%;
  background: #906441;
}

/* The tension marker: an arrow pointing left at the zone and a flared bar across the bar, drawn in its own units */
.fishing-tension {
  position: absolute;
  top: calc(var(--unit) * -9);
  width: calc(var(--unit) * 30);
  height: calc(var(--unit) * 30);
  margin-left: calc(var(--unit) * -24);
  fill: #fff7b2;
}

/* The reel's ring above the bar, its pale arc held round from twelve o'clock to where the dark arc starts */
.fishing-ring {
  position: absolute;
  top: calc(var(--unit) * 167);
  left: calc(50% - var(--unit) * 25);
  width: calc(var(--unit) * 50);
  height: calc(var(--unit) * 50);
  border-radius: 50%;
  background: conic-gradient(#feffc0 0 83%, #404c55 83%);
  mask: radial-gradient(closest-side, transparent 72%, #000 73%);
}

/* The hook in the ring's centre, traced from the still at 20 by 24 units */
.fishing-hook {
  position: absolute;
  top: calc(var(--unit) * 180);
  left: calc(50% - var(--unit) * 9);
  width: calc(var(--unit) * 20);
  height: calc(var(--unit) * 24);
  fill: #cbd8e8;
}
</style>
