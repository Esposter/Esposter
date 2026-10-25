<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { AxisVisualPropsData } from "@/models/dashboard/AxisVisualPropsData";

import { COMPACT_NUMBER_FORMATTER, NUMBER_FORMATTER } from "#shared/services/intl/constants";
import { takeOne } from "@esposter/shared";

interface Props {
  data: AxisVisualPropsData;
  visual: Visual;
}

const { data, visual } = defineProps<Props>();
// The compute gives a card one series of one value, named for its aggregation and column, which is the label a card
// Shows unless the owner has written their own
const series = computed(() => takeOne(data.series));
const value = computed(() => Number(takeOne(series.value.data)));
const label = computed(() => visual.chart.configuration.title || `${series.value.name}`);
// A value of a thousand or more reads in the compact form a reader scans, and a smaller one keeps its decimals
const displayValue = computed(() =>
  value.value >= 1000 ? COMPACT_NUMBER_FORMATTER.format(value.value) : NUMBER_FORMATTER.format(value.value),
);
</script>

<template>
  <div flex flex-col gap-1 items-center justify-center size-full p-3 text-center>
    <span text-4xl fw-semibold>{{ displayValue }}</span>
    <span text-muted>{{ label }}</span>
  </div>
</template>
