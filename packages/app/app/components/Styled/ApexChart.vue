<script setup lang="ts">
import type { VueApexChartsComponentProps } from "vue3-apexcharts";

import { defu } from "defu";
import VueApexCharts from "vue3-apexcharts";

type ApexChartProps = Pick<VueApexChartsComponentProps, "options" | "series" | "type">;

const { options = {}, series, type } = defineProps<ApexChartProps>();
const isDark = useIsDark();
// Vuetify owns the theme, so pin the mode instead of letting ApexCharts auto-resolve it.
// The mode flip also re-renders the chart, which re-reads the "--apx-*" design tokens (globals.scss).
const themedOptions = computed(() => defu({ theme: { mode: isDark.value ? "dark" : "light" } } as const, options));
</script>

<template>
  <VueApexCharts :options="themedOptions" :series :type />
</template>
