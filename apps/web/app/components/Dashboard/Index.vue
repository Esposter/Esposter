<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { DASHBOARD_PUBLISHED_ROW_HEIGHT } from "@/services/dashboard/constants";
import { exportDashboardVisualCsv } from "@/services/dashboard/export/exportDashboardVisualCsv";
import { getBreakpointColumnNumber } from "@/services/dashboard/grid/getBreakpointColumnNumber";

interface Props {
  visuals: Visual[];
}

const { visuals } = defineProps<Props>();
const container = useTemplateRef("container");
const { width } = useElementSize(container);
// The published dashboard only shows its visuals, so a narrower screen reflows them and nothing here is saved
// The grid waits for the width, since before it is measured the columns would be the narrowest breakpoint's and
// Every tile would have no width
const columnNumber = computed(() => getBreakpointColumnNumber(width.value));
</script>

<template>
  <div ref="container">
    <DashboardGrid v-if="width" :column-number :row-height="DASHBOARD_PUBLISHED_ROW_HEIGHT" :visuals>
      <template #default="{ visual }">
        <!-- A viewer's file is the published rows, which the snapshot holds, so the export reads nothing live -->
        <DashboardVisual :visual>
          <template #actions="{ dataset }">
            <UiIconButton
              v-if="dataset"
              label="Export CSV"
              :meaning="UiIconMeaning.Download"
              :variant="UiButtonVariant.Quiet"
              @click="exportDashboardVisualCsv(visual, dataset)"
            />
          </template>
        </DashboardVisual>
      </template>
    </DashboardGrid>
  </div>
</template>
