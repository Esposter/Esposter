<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { Dataset } from "#shared/models/dataset/Dataset";
import type { DashboardVisualEmits } from "@/models/dashboard/DashboardVisualEmits";
import type { CollisionMode, CompactType } from "vue-grid-layout-headless";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { VISUAL_INTERACTION_CHART_OPTIONS } from "@/services/dashboard/chart/constants";
import { getVisualLinkChartOptions } from "@/services/dashboard/chart/getVisualLinkChartOptions";
import { checkIsAxisVisualPropsData } from "@/services/dashboard/checkIsAxisVisualPropsData";
import { VisualTypeDemoDataMap } from "@/services/dashboard/demo/VisualTypeDemoDataMap";
import { exportDashboardVisualCsv } from "@/services/dashboard/export/exportDashboardVisualCsv";
import { useClipboardStore } from "@/store/clipboard";
import { takeOne } from "@esposter/shared";
import { defu } from "defu";

interface Props {
  collision: CollisionMode;
  compactType: CompactType;
  // Drawn in the editor, where a group's grid takes edits and its children are the editor's own tiles
  isEditable?: true;
  visual: Visual;
}

// The editor's tile fills this corner with its own actions, which share the row with Copy link and Refresh. A group's
// Children are drawn by the caller's child slot, and by this component again when it gives none
defineSlots<{ actions?: (props: { dataset?: Dataset }) => VNode; child?: (props: { visual: Visual }) => VNode }>();
const { collision, compactType, isEditable, visual } = defineProps<Props>();
const emit = defineEmits<DashboardVisualEmits>();
const container = useTemplateRef("container");
const chart = useTemplateRef("chart");
const height = ref<number>();
// Grid layout + library CSS drive the height, so observe it for changes.
useResizeObserver(container, (entries) => {
  const entry = takeOne(entries);
  height.value = entry.target.clientHeight;
});

const { error, isPending, refresh, resolvedDataset, truncation, visualPropsData } = useVisualPropsData(() => visual);
// The rows a visual draws, which the editor's menu and a viewer's export both take, and nothing for a demo or a failed read
const drawnDataset = computed(() => (visualPropsData.value ? resolvedDataset.value : undefined));
const isGroup = computed(() => visual.type === VisualType.Group);
// A chart draws its own toolbar along the top right of the tile, so the tile's marks start below it
const isChart = computed(() => !isGroup.value && visual.type !== VisualType.Card && visual.type !== VisualType.Table);
const data = computed(() => visualPropsData.value ?? VisualTypeDemoDataMap[visual.type](visual.chart.type));
const options = useApexOptions(
  () => visual.chart,
  () => visual.type,
  computed(() => ({ ...data.value.options, chart: { ...VISUAL_INTERACTION_CHART_OPTIONS, height: height.value } })),
);
// Layered after the resolvers rather than ahead of them, because which visuals may be linked is decided by the
// Chart type they resolve to — the same visual is an axis chart or a donut depending on its chart configuration
const linkedOptions = computed(() => {
  const visualLinkChartOptions = getVisualLinkChartOptions(visual, options.value.chart?.type);
  return defu({ chart: visualLinkChartOptions }, options.value);
});
const { applyView, getViewUrl } = useVisualPerspective(
  () => visual.id,
  () => chart.value?.getChart(),
);
const clipboardStore = useClipboardStore();
const { copy } = clipboardStore;
</script>

<template>
  <div size-full relative ui-frame>
    <DashboardVisualGroup
      v-if="isGroup"
      :collision
      :compact-type
      :is-editable
      :visual
      @commit="(changes) => emit('commit', changes)"
      @open="(child) => emit('open', child)"
      @transfer="(transfer) => emit('transfer', transfer)"
    >
      <template #default="{ visual: child }">
        <slot name="child" :visual="child">
          <DashboardVisual :collision :compact-type :is-editable :visual="child" />
        </slot>
      </template>
    </DashboardVisualGroup>
    <div v-else ref="container" h-full relative>
      <UiErrorState v-if="error" pointer-events-auto :error @retry="refresh()" />
      <!-- A bound visual's own data is on its way: the tile's shape rather than the demo data it would otherwise show -->
      <div v-else-if="visual.dataset && !visualPropsData && isPending" p-3 size-full>
        <UiSkeleton size-full />
      </div>
      <!-- A card and a table draw their own values, so they take the same data a chart would, and no chart options -->
      <DashboardVisualCard
        v-else-if="visual.type === VisualType.Card && checkIsAxisVisualPropsData(data)"
        :data
        :visual
      />
      <DashboardVisualTable
        v-else-if="visual.type === VisualType.Table && checkIsAxisVisualPropsData(data)"
        :data
        :visual
      />
      <StyledApexChart v-else ref="chart" :="data" :options="linkedOptions" @load="applyView()" />
      <!-- A capped read still charts, so the footnote is what stops it from reading as the whole picture -->
      <DatasetTruncationFootnote v-if="truncation" bottom-1 left-1 absolute :truncation />
    </div>
    <!-- The corner's marks clear the corner handle: the right inset is the cap, which resolves against the width, and
      the top is the whole handle, since the cap's percentage has no height to resolve against on an auto-height
      tile, or below a chart's own toolbar -->
    <div
      :top="isChart ? '9' : '[var(--dashboard-handle)]'"
      right="[var(--dashboard-cap)]"
      flex
      gap-1
      pointer-events-auto
      absolute
      z-1
    >
      <slot name="actions" :dataset="drawnDataset" />
      <!-- A viewer's file is the published rows, which the snapshot holds, so the export reads nothing live -->
      <UiIconButton
        v-if="!isEditable && drawnDataset"
        label="Export CSV"
        :meaning="UiIconMeaning.Download"
        :variant="UiButtonVariant.Quiet"
        @click="exportDashboardVisualCsv(visual, drawnDataset)"
      />
      <!-- A group draws no data of its own, so it has no link to copy and nothing to refresh -->
      <template v-if="!isGroup">
        <!-- The zoom, the hidden series and the selection are the reader's own work, so the link they send
          Carries it rather than dropping the recipient on the unfiltered dashboard -->
        <UiIconButton
          label="Copy link to this view"
          :meaning="UiIconMeaning.Link"
          :variant="UiButtonVariant.Quiet"
          @click="
            () => {
              const viewUrl = getViewUrl();
              copy(viewUrl);
            }
          "
        />
        <!-- A snapshotted binding renders baked data, so there is nothing to refresh -->
        <UiIconButton
          v-if="visual.dataset && !visual.dataset.snapshot"
          :disabled="isPending"
          label="Refresh data"
          :meaning="UiIconMeaning.Refresh"
          :variant="UiButtonVariant.Quiet"
          @click="refresh()"
        />
      </template>
    </div>
  </div>
</template>
