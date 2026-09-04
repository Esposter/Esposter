<script setup lang="ts">
import type ApexCharts from "apexcharts";
import type { VueApexChartsComponentProps } from "vue3-apexcharts";

import { defu } from "defu";
import VueApexCharts from "vue3-apexcharts";

type Props = Pick<VueApexChartsComponentProps, "options" | "series" | "type">;

const { options = {}, series, type } = defineProps<Props>();
const isDark = useIsDark();
const chart = useTemplateRef<{ chart?: ApexCharts }>("chart");
// Vuetify owns the theme, so the mode is pinned instead of letting ApexCharts auto-resolve it. The mode flip
// Also re-renders the chart, which re-reads the "--apx-*" design tokens (globals.scss)
const themedOptions = computed(() => defu({ theme: { mode: isDark.value ? "dark" : "light" } } as const, options));
// The chart instance, for the view state a caller captures and restores off it. Handed out as a getter rather
// Than the ref, because it exists only between the component's mounted and unmounted events
defineExpose({ getChart: () => chart.value?.chart });
</script>

<template>
  <VueApexCharts ref="chart" :options="themedOptions" :series :type />
</template>
