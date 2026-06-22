<script setup lang="ts">
import { INPUT_LEVEL_METER_SEGMENT_COUNT } from "@/services/message/settings/constants";
import { MAX_INPUT_SENSITIVITY_DECIBELS, MIN_INPUT_SENSITIVITY_DECIBELS } from "@esposter/db-schema";

interface MeterProps {
  level: number;
}

const { level } = defineProps<MeterProps>();
const levelFraction = computed(
  () => (level - MIN_INPUT_SENSITIVITY_DECIBELS) / (MAX_INPUT_SENSITIVITY_DECIBELS - MIN_INPUT_SENSITIVITY_DECIBELS),
);
// Hue ramps yellow (quiet) to green (loud); unlit bars stay dimmed so the meter is always visible.
const segments = computed(() =>
  Array.from({ length: INPUT_LEVEL_METER_SEGMENT_COUNT }, (_, index) => {
    const fraction = (index + 1) / INPUT_LEVEL_METER_SEGMENT_COUNT;
    return { fraction, hue: 55 + 65 * fraction, isLit: fraction <= levelFraction.value };
  }),
);
</script>

<template>
  <div flex h-4 w-full items-stretch gap-0.5>
    <div
      v-for="{ fraction, hue, isLit } of segments"
      :key="fraction"
      flex-1
      rounded-sm
      :style="{ backgroundColor: `hsl(${hue}, 70%, 45%)`, opacity: isLit ? 1 : 0.15 }"
    />
  </div>
</template>
