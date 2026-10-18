<script setup lang="ts">
import type { FishingPhase } from "#src/models/fishing/FishingPhase";
import type { FishingZone } from "#src/models/fishing/FishingZone";

import { REEL_BAR_MAX } from "#src/services/fishing/constants";

interface Props {
  // The cast as it stands: its phase, the tension held on the bar and the zone it is held in, or none while no line is out
  view?: { phase: FishingPhase; tension: number; zone: FishingZone };
}

const { view } = defineProps<Props>();
const percent = (value: number) => `${(value / REEL_BAR_MAX) * 100}%`;
</script>

<template>
  <div class="fishing-bar" :data-phase="view?.phase">
    <template v-if="view">
      <div class="fishing-zone" :style="{ left: percent(view.zone.start), width: percent(view.zone.width) }" />
      <div class="fishing-tension" :style="{ left: percent(view.tension) }" />
    </template>
  </div>
</template>

<style scoped>
.fishing-bar {
  position: fixed;
  bottom: 12%;
  left: 50%;
  width: min(60vw, 480px);
  height: 14px;
  transform: translateX(-50%);
  background: rgb(0 0 0 / 0.5);
  border-radius: 7px;
  overflow: hidden;
}

.fishing-zone {
  position: absolute;
  top: 0;
  bottom: 0;
  background: rgb(120 200 255 / 0.7);
}

.fishing-tension {
  position: absolute;
  top: -3px;
  bottom: -3px;
  width: 4px;
  margin-left: -2px;
  background: white;
}
</style>
