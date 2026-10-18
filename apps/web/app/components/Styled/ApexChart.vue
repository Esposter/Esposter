<script setup lang="ts">
import type { ApexChart, ApexOptions } from "apexcharts";

import { getStyledApexOptions } from "@/services/styled/getStyledApexOptions";
import { useThemeModeStore } from "@/store/ui/themeMode";
import { clonePlainDeep } from "@esposter/shared";
import ApexCharts from "apexcharts";

interface Props {
  options?: ApexOptions;
  series: NonNullable<ApexOptions["series"]>;
  type?: ApexChart["type"];
}

const { options = {}, series, type } = defineProps<Props>();
const emit = defineEmits<{ load: [] }>();
const themeModeStore = useThemeModeStore();
const { isDark } = storeToRefs(themeModeStore);
const container = useTemplateRef("container");
const styledOptions = computed(() => getStyledApexOptions({ isDark: isDark.value, options, series, type }));
// The engine owns everything inside the instance, so it is held shallowly and exists only between mount and unmount
const chart = shallowRef<ApexCharts>();
// The engine writes into the config it is handed (a legend hide empties the hidden row in place), so it is handed a
// Copy rather than the caller's data or the proxies over it
const render = async () => {
  if (!container.value) return;
  chart.value = new ApexCharts(container.value, clonePlainDeep(styledOptions.value));
  await chart.value.render();
  emit("load");
};
// The instance, for the view state a caller captures and restores off it. Handed out as a getter rather than the ref,
// Because it exists only between the component's mount and unmount
defineExpose({ getChart: () => chart.value });

// A new type rebuilds the chart, since the engine draws a different set of axes and layers for it; anything else is an
// Update the engine animates in place
watch(styledOptions, async (newStyledOptions, oldStyledOptions) => {
  if (!chart.value) return;
  else if (newStyledOptions.chart?.type === oldStyledOptions.chart?.type)
    await chart.value.updateOptions(clonePlainDeep(newStyledOptions));
  else {
    chart.value.destroy();
    await render();
  }
});

onMounted(async () => {
  await render();
});

onUnmounted(() => {
  chart.value?.destroy();
});
</script>

<template>
  <div ref="container" class="chart" />
</template>

<style scoped>
/* What ApexCharts declares or paints on its own elements rather than reading off the chart's — its gains and losses,
   Its focus ring, its toolbar and menus, its tooltips — much of it again per mode, so each is set a scope deeper. What
   Floats over the chart is a lifted frame, in that surface's tone, corner and shadow with no hairline of its own, and
   What is pressed in it is tinted as a quiet button is */
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
