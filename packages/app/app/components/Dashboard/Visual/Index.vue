<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { VisualTypeDemoDataMap } from "@/services/dashboard/demo/VisualTypeDemoDataMap";
import { takeOne } from "@esposter/shared";

interface VisualProps {
  visual: Visual;
}

const { visual } = defineProps<VisualProps>();
const container = useTemplateRef("container");
const height = ref<number>();
// Grid layout + library CSS drive the height, so observe it for changes.
useResizeObserver(container, (entries) => {
  const entry = takeOne(entries);
  height.value = entry.target.clientHeight;
});

const { error, isLoading, refresh, truncation, visualPropsData } = useVisualPropsData(() => visual);
const data = computed(() => visualPropsData.value ?? VisualTypeDemoDataMap[visual.type](visual.chart.type));
const refreshButtonProps = computed(() => ({
  loading: isLoading.value,
  size: "small" as const,
  variant: "text" as const,
}));
const options = useApexOptions(
  () => visual.chart,
  () => visual.type,
  computed(() => ({
    ...data.value.options,
    chart: {
      height: height.value,
      // Rewind: Ctrl+Z / Ctrl+Shift+Z undoes zoom, pan, and selection state on the focused chart
      history: { enabled: true, keyboard: true },
    },
  })),
);
</script>

<template>
  <StyledCard size-full>
    <div ref="container" h-full relative>
      <v-alert v-if="error" type="error" text="Failed to load data" />
      <StyledApexChart v-else :="data" :options />
      <!-- A capped read still charts, so the footnote is what stops it from reading as the whole picture -->
      <DatasetTruncationFootnote v-if="truncation" bottom-1 left-1 absolute :truncation />
      <!-- A snapshotted binding renders baked data, so there is nothing to refresh -->
      <StyledTooltipIconButton
        v-if="visual.dataset && !visual.dataset.snapshot"
        right-1
        top-1
        absolute
        icon="mdi-refresh"
        text="Refresh data"
        :button-props="refreshButtonProps"
        @click="refresh()"
      />
    </div>
  </StyledCard>
</template>
