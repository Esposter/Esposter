<script setup lang="ts">
import type { GenshinSettings } from "#src/models/menu/GenshinSettings";
import type { SettingsTrackRow } from "#src/models/menu/SettingsTrackRow";
import type { GameText } from "genshin-text";

import { SettingsRowKind } from "#src/models/menu/SettingsRowKind";
import { getTrackShare } from "#src/services/menu/getTrackShare";
import { getTrackValue } from "#src/services/menu/getTrackValue";
import { snapToRange } from "#src/services/menu/snapToRange";

interface Props {
  // The game's words in the reader's language, which the slider's label reads
  gameText: GameText;
  // The range or the volume the slider moves across, whose setting the world backs it with, or the slider the world does
  // Not back, which is drawn at its value and moves by no pointer or key
  row: SettingsTrackRow;
}

// The settings the slider sets, which the host keeps on this device
const settings = defineModel<GenshinSettings>("settings", { required: true });
const { gameText, row } = defineProps<Props>();
const trackValue = computed(() => getTrackValue(row, settings.value));
const isBacked = computed(() => row.kind !== SettingsRowKind.Slider);
// Sets the value, held within the row's range, of a slider the world backs
const setBackedValue = (value: number): void => {
  if (row.kind === SettingsRowKind.Slider) return;
  settings.value = { ...settings.value, [row.setting]: snapToRange(value, row.range) };
};
// A value follows the pointer while its button is held, the pointer captured at the press so a drag past the track's
// Ends keeps setting it, where the value stops at its limit
const dragSetting = (event: PointerEvent): void => {
  if (!(event.currentTarget instanceof HTMLElement) || event.buttons === 0) return;

  const { left, width } = event.currentTarget.getBoundingClientRect();
  setBackedValue(row.range.min + ((event.clientX - left) / width) * (row.range.max - row.range.min));
};
</script>

<template>
  <div
    class="slider"
    role="slider"
    :aria-disabled="isBacked ? undefined : true"
    tabindex="0"
    :aria-label="gameText[row.labelKey]"
    :aria-valuemax="row.range.max"
    :aria-valuemin="row.range.min"
    :aria-valuenow="trackValue"
    @keydown="
      (event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') setBackedValue(trackValue - row.range.step);
        else if (event.key === 'ArrowRight' || event.key === 'ArrowUp') setBackedValue(trackValue + row.range.step);
        else return;

        event.preventDefault();
      }
    "
    @pointerdown="
      (event) => {
        (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
        dragSetting(event);
      }
    "
    @pointermove="dragSetting($event)"
  >
    <span class="knob" :style="{ left: `${getTrackShare(trackValue, row.range) * 100}%` }" />
  </div>
</template>

<style scoped src="../../../../../styles/settingsSlider.css"></style>
