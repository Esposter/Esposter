<script setup lang="ts">
import type ApexCharts from "apexcharts";
import type { VueApexChartsComponentProps } from "vue3-apexcharts";

import { defu } from "defu";
// v7 ships the renderer opt-in, so `chart.renderer` below is inert without it — and inert silently, because an
// Unregistered feature is a config key nothing reads rather than an error
import "apexcharts/features/renderer-canvas";
import VueApexCharts from "vue3-apexcharts";

type ApexChartProps = Pick<VueApexChartsComponentProps, "options" | "series" | "type">;

const { options = {}, series, type } = defineProps<ApexChartProps>();
const isDark = useIsDark();
const chart = useTemplateRef<{ chart?: ApexCharts }>("chart");
// Two things every chart in the app gets, whatever it is drawing:
//
// Vuetify owns the theme, so the mode is pinned instead of letting ApexCharts auto-resolve it. The mode flip
// Also re-renders the chart, which re-reads the "--apx-*" design tokens (globals.scss).
//
// The series layer paints to canvas once a chart carries more points than the renderer's threshold, while the
// Axes, tooltips, annotations and exports stay SVG — so a dense chart costs nothing anywhere else.
const themedOptions = computed(() =>
  defu({ chart: { renderer: "auto" }, theme: { mode: isDark.value ? "dark" : "light" } } as const, options),
);
// The chart instance, for the view state a caller captures and restores off it. Handed out as a getter rather
// Than the ref, because it exists only between the component's mounted and unmounted events
defineExpose({ getChart: () => chart.value?.chart });
</script>

<template>
  <VueApexCharts ref="chart" :options="themedOptions" :series :type />
</template>
