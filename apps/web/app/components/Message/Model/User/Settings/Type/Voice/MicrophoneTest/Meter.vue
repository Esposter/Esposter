<script setup lang="ts">
import { INPUT_LEVEL_METER_SEGMENT_COUNT } from "@/services/message/settings/constants";
import { getInputSensitivityFraction } from "@/services/message/settings/getInputSensitivityFraction";

interface Props {
  level: number;
}

const { level } = defineProps<Props>();
const levelFraction = computed(() => getInputSensitivityFraction(level));
// Hue ramps yellow (quiet) to green (loud); unlit bars stay dimmed so the meter is always visible.
const segments = computed(() =>
  Array.from({ length: INPUT_LEVEL_METER_SEGMENT_COUNT }, (_value, index) => {
    const fraction = (index + 1) / INPUT_LEVEL_METER_SEGMENT_COUNT;
    return { fraction, hue: 55 + 65 * fraction, isLit: fraction <= levelFraction.value };
  }),
);
</script>

<template>
  <div flex gap-0.5 h-4 w-full items-stretch>
    <div
      v-for="{ fraction, hue, isLit } of segments"
      :key="fraction"
      rd-sm
      flex-1
      :style="{ backgroundColor: `hsl(${hue}, 70%, 45%)`, opacity: isLit ? 1 : 0.15 }"
    />
  </div>
</template>
