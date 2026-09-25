<script setup lang="ts">
import type ApexCharts from "apexcharts";
import type { VueApexChartsComponentProps } from "vue3-apexcharts";

import { ApexChartMarkerShapes } from "@/services/styled/ApexChartMarkerShapes";
import { defu } from "defu";
import VueApexCharts from "vue3-apexcharts";

type Props = Pick<VueApexChartsComponentProps, "options" | "series" | "type">;

const { options = {}, series, type } = defineProps<Props>();
const isDark = useIsDark();
const chart = useTemplateRef<{ chart?: ApexCharts }>("chart");
// The UI library owns the theme, so the mode is pinned instead of letting ApexCharts auto-resolve it. The mode flip
// Also re-renders the chart, which re-reads the "--apx-*" design tokens (globals.scss). Each series takes its own
// Marker shape unless the caller names one. A line or an area sizes its markers to 0 in ApexCharts, so it is given a
// Size there for the shapes to be seen; every other type keeps its own
const themedOptions = computed(() =>
  defu({ theme: { mode: isDark.value ? "dark" : "light" } } as const, options, {
    markers: {
      shape: ApexChartMarkerShapes,
      ...(type === "area" || type === "line" || type === "rangeArea" ? { size: 4 } : {}),
    },
  }),
);
// The chart instance, for the view state a caller captures and restores off it. Handed out as a getter rather
// Than the ref, because it exists only between the component's mounted and unmounted events
defineExpose({ getChart: () => chart.value?.chart });
</script>

<template>
  <VueApexCharts ref="chart" class="chart" :options="themedOptions" :series :type />
</template>

<style scoped>
/* What ApexCharts declares or paints on its own elements rather than reading off the chart's — its gains and losses, its
   Focus ring, its toolbar and menus, its tooltips — much of it again per mode, so each is set a scope deeper. What floats
   Over the chart is a lifted frame, in that surface's tone, corner and shadow with no hairline of its own, and what is
   Pressed in it is tinted as a quiet button is */
.chart :deep(.apexcharts-canvas) {
  --apexcharts-focus-color: var(--ui-accent);
  --apx-measure-down: var(--ui-error);
  --apx-measure-guide: var(--ui-divider);
  --apx-measure-neutral: var(--ui-muted);
  --apx-measure-up: var(--ui-success);
  --apx-menu-bg: var(--ui-lifted);
  --apx-menu-border: transparent;
  --apx-menu-fg: var(--ui-text);
  --apx-menu-hover: color-mix(in srgb, var(--ui-tint) 10%, var(--ui-lifted));
  --apx-menu-shadow: transparent;
}

.chart :deep(:is(.apexcharts-toolbar, .apexcharts-menu, .apexcharts-context-menu)) {
  border-color: transparent;
  border-radius: var(--ui-container-radius);
  background: var(--ui-lifted);
  box-shadow: var(--ui-lifted-shadow);
  color: var(--ui-text);
  backdrop-filter: none;
}

.chart :deep(.apexcharts-toolbar [class*="-icon"]) {
  color: var(--ui-muted);
}

.chart :deep(.apexcharts-toolbar .apexcharts-selected) {
  color: var(--ui-accent);
}

.chart :deep(:is(.apexcharts-toolbar [class*="-icon"], .apexcharts-menu-item):is(:hover, :focus-visible)) {
  background: color-mix(in srgb, var(--ui-tint) 10%, transparent);
  color: var(--ui-text);
}

.chart :deep(:is(.apexcharts-tooltip, .apexcharts-xaxistooltip, .apexcharts-yaxistooltip)) {
  --apx-axt-bg: var(--ui-lifted);
  --apx-axt-border: transparent;
  --apx-axt-color: var(--ui-text);
  --apx-axt-shadow: var(--ui-lifted-shadow);
  --apx-tt-bg: var(--ui-lifted);
  --apx-tt-border: transparent;
  --apx-tt-color: var(--ui-text);
  --apx-tt-color-muted: var(--ui-muted);
  --apx-tt-shadow: var(--ui-lifted-shadow);
  border-radius: var(--ui-container-radius);
}
</style>
