<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { VISUAL_INTERACTION_CHART_OPTIONS } from "@/services/dashboard/chart/constants";
import { getVisualLinkChartOptions } from "@/services/dashboard/chart/getVisualLinkChartOptions";
import { VisualTypeDemoDataMap } from "@/services/dashboard/demo/VisualTypeDemoDataMap";
import { useClipboardStore } from "@/store/clipboard";
import { takeOne } from "@esposter/shared";
import { defu } from "defu";

interface Props {
  visual: Visual;
}

const { visual } = defineProps<Props>();
const container = useTemplateRef("container");
const chart = useTemplateRef("chart");
const height = ref<number>();
// Grid layout + library CSS drive the height, so observe it for changes.
useResizeObserver(container, (entries) => {
  const entry = takeOne(entries);
  height.value = entry.target.clientHeight;
});

const { error, isPending, refresh, truncation, visualPropsData } = useVisualPropsData(() => visual);
const data = computed(() => visualPropsData.value ?? VisualTypeDemoDataMap[visual.type](visual.chart.type));
const buttonProps = { size: "small", variant: "text" } as const;
const refreshButtonProps = computed(() => ({ ...buttonProps, loading: isPending.value }));
const options = useApexOptions(
  () => visual.chart,
  () => visual.type,
  computed(() => ({
    ...data.value.options,
    chart: { ...VISUAL_INTERACTION_CHART_OPTIONS, height: height.value },
  })),
);
// Layered after the resolvers rather than ahead of them, because which visuals may be linked is decided by the
// Chart type they resolve to — the same visual is an axis chart or a donut depending on its chart configuration
const linkedOptions = computed(() =>
  defu({ chart: getVisualLinkChartOptions(visual, options.value.chart?.type) }, options.value),
);
const { applyView, readViewUrl } = useVisualPerspective(
  () => visual.id,
  () => chart.value?.getChart(),
);
const clipboardStore = useClipboardStore();
const { copy } = clipboardStore;
</script>

<template>
  <StyledCard size-full>
    <div ref="container" h-full relative>
      <v-alert v-if="error" type="error" text="Failed to load data" />
      <StyledApexChart v-else ref="chart" :="data" :options="linkedOptions" @mounted="applyView" />
      <!-- A capped read still charts, so the footnote is what stops it from reading as the whole picture -->
      <DatasetTruncationFootnote v-if="truncation" bottom-1 left-1 absolute :truncation />
      <div flex right-1 top-1 absolute>
        <!-- The zoom, the hidden series and the selection are the reader's own work, so the link they send
          Carries it rather than dropping the recipient on the unfiltered dashboard -->
        <StyledTooltipIconButton
          icon="mdi-link-variant"
          text="Copy link to this view"
          :button-props
          @click="copy(readViewUrl())"
        />
        <!-- A snapshotted binding renders baked data, so there is nothing to refresh -->
        <StyledTooltipIconButton
          v-if="visual.dataset && !visual.dataset.snapshot"
          icon="mdi-refresh"
          text="Refresh data"
          :button-props="refreshButtonProps"
          @click="refresh()"
        />
      </div>
    </div>
  </StyledCard>
</template>
