<script setup lang="ts">
import { METER_BLOCK_COUNT } from "@/services/ui/constants";

interface Props {
  // Past it the reading is at its worst, drawn in the danger colour, as a native meter's high mark
  high: number;
  label: string;
  // Past it the reading is getting worse, drawn in the warning colour, as a native meter's low mark
  low: number;
  // How much of the whole is used, out of a hundred
  value: number;
  // The reading in words, which a screen reader says in place of the number
  valueText: string;
}

// A reading of how much of something is used, as a row of voxel blocks in the loading bar's look that fill with it.
// Lower is better, so the filled blocks turn to the warning colour past the low mark and to the danger colour past
// The high one
const { high, label, low, value, valueText } = defineProps<Props>();
const uiStyle = useUiStyle();
const filledBlockCount = computed(() => Math.round((value / 100) * METER_BLOCK_COUNT));
const level = computed(() => {
  if (value >= high) return "high";
  else if (value >= low) return "low";
  else return undefined;
});
</script>

<template>
  <div
    :aria-label="label"
    aria-valuemax="100"
    aria-valuemin="0"
    :aria-valuenow="value"
    :aria-valuetext="valueText"
    :data-level="level"
    :data-ui-style="uiStyle"
    role="meter"
    ui-blocks
  >
    <span
      v-for="index of METER_BLOCK_COUNT"
      :key="index"
      :data-filled="index <= filledBlockCount || undefined"
      ui-block
    />
  </div>
</template>

<style scoped>
[data-level="low"] [data-filled] {
  background-color: var(--ui-warning);
}

[data-level="high"] [data-filled] {
  background-color: var(--ui-error);
}
</style>
