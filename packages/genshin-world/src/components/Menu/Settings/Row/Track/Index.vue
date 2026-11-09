<script setup lang="ts">
import type { GenshinSettings } from "#src/models/menu/GenshinSettings";
import type { SettingsTrackRow } from "#src/models/menu/SettingsTrackRow";
import type { GameText } from "genshin-text";

import MenuSettingsRowSlider from "#src/components/Menu/Settings/Row/Slider/Index.vue";
import { SettingsTab } from "#src/models/menu/SettingsTab";
import { getTrackValue } from "#src/services/menu/getTrackValue";

interface Props {
  // The game's words in the reader's language
  gameText: GameText;
  // The range, the volume or the slider the track shows, which the row's own kind reads its value from
  row: SettingsTrackRow;
  // The tab the row is on, under which the Audio tab draws a volume's speaker
  tab: SettingsTab;
}

// The settings the track shows and changes, which the host keeps on this device
const settings = defineModel<GenshinSettings>("settings", { required: true });
defineProps<Props>();
// A value reads with one decimal place where its range steps by tenths, and as a whole number everywhere else
const formatTrackValue = (trackRow: SettingsTrackRow): string =>
  getTrackValue(trackRow, settings.value).toFixed(trackRow.range.step < 1 ? 1 : 0);
</script>

<template>
  <svg v-if="tab === SettingsTab.Audio" class="speaker" aria-hidden="true" viewBox="0 0 36 30">
    <path d="M 3 10 L 9 10 L 18 3 L 18 27 L 9 20 L 3 20 Z" />
    <path class="wave" d="M 23 9 Q 26 15 23 21 M 28 5 Q 33 15 28 25" />
  </svg>
  <span class="volume">{{ formatTrackValue(row) }}</span>
  <MenuSettingsRowSlider v-model:settings="settings" :game-text :row />
</template>

<style scoped>
/* A volume's speaker, its number in a faint box and its slider, the knob a diamond at its share of the line. Provisional:
   Their sizes and places, read by eye off the clip's Audio tab at 178 seconds */
.speaker {
  position: absolute;
  top: calc(var(--unit) * 11.5);
  left: calc(var(--unit) * 798);
  width: calc(var(--unit) * 45);
  height: calc(var(--unit) * 33);
  fill: #4b5568;
}

.speaker .wave {
  fill: none;
  stroke: rgb(75 85 104 / 0.45);
  stroke-width: 3;
}

.volume {
  position: absolute;
  top: calc(var(--unit) * 11);
  left: calc(var(--unit) * 852);
  width: calc(var(--unit) * 70);
  height: calc(var(--unit) * 34);
  border-radius: calc(var(--unit) * 6);
  background: rgb(75 77 84 / 0.03);
  line-height: calc(var(--unit) * 34);
  text-align: center;
}
</style>
