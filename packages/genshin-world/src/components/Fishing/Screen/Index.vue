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
        <div class="fishing-tension" :style="{ left: percent(view.tension) }" />
      </div>
      <div class="fishing-ring" />
    </template>
  </GameScreen>
</template>

<style scoped>
.fishing-bar {
  position: absolute;
  top: calc(var(--unit) * 131);
  left: calc(var(--unit) * 716);
  width: calc(var(--unit) * 488);
  height: calc(var(--unit) * 11);
  background: #6d4c43;
}

.fishing-fill {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  background: #ffcc30;
}

.fishing-zone {
  position: absolute;
  top: calc(var(--unit) * -5);
  bottom: calc(var(--unit) * -6);
  box-sizing: border-box;
  border: calc(var(--unit) * 2.5) solid #fff7b2;
  background: #906441;
}

.fishing-tension {
  position: absolute;
  top: calc(var(--unit) * -8);
  bottom: calc(var(--unit) * -7);
  width: calc(var(--unit) * 6);
  margin-left: calc(var(--unit) * -3);
  background: #fff7b2;
}

/* The reel's ring above the bar, its pale arc held round from twelve o'clock to where the dark arc starts */
.fishing-ring {
  position: absolute;
  top: calc(var(--unit) * 166);
  left: calc(50% - var(--unit) * 25);
  width: calc(var(--unit) * 50);
  height: calc(var(--unit) * 50);
  border-radius: 50%;
  background: conic-gradient(#fcfdbb 0 81%, #445e65 81%);
  mask: radial-gradient(closest-side, transparent 72%, #000 73%);
}
</style>
