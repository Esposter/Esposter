<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { DashboardGridTransfer } from "#src/models/dashboard/DashboardGridTransfer";
import type { GridBlock } from "vue-grid-layout-headless";

import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import {
  DASHBOARD_EDITOR_ROW_HEIGHT,
  DASHBOARD_GRID_COMMANDS,
  DASHBOARD_NO_COLUMNS,
} from "#src/services/dashboard/constants";
import { useDashboardStore } from "#src/store/dashboard/index";
import { useVisualStore } from "#src/store/dashboard/visual";

const dashboardStore = useDashboardStore();
const { dashboard } = storeToRefs(dashboardStore);
const visualStore = useVisualStore();
const { visuals } = storeToRefs(visualStore);
const { clearSelection, editItem, moveVisual, updateVisual } = visualStore;
const isEmpty = computed(() => visuals.value.length === 0);
const canvas = useTemplateRef("canvas");
// A press on the empty canvas clears the selection. A visual's tile is a nested interaction of the canvas, so a press
// On the tile passes over it
onClickExceptDrag(canvas, () => {
  clearSelection();
});
// Every grid of the editor takes these keys and binds none, so the editor registers them once, however many groups it holds
// The keys are registered only while the editor draws a grid, since the empty dashboard has no visual for them to act on
useCommands(() => (isEmpty.value ? [] : DASHBOARD_GRID_COMMANDS));
// The dashboard's grid and every group's grid write through these, so a nested commit, open or transfer is the same write
// By id as the dashboard's own, wherever the visual sits
const commitVisuals = (changes: GridBlock[]) => {
  for (const change of changes) updateVisual(change);
};
const openVisual = (visual: Visual) => {
  editItem({ id: visual.id });
};
const transferVisual = (transfer: DashboardGridTransfer) => {
  moveVisual({ id: transfer.id }, transfer.targetGroupId, transfer.cell);
};
</script>

<template>
  <UiEmptyState
    v-if="isEmpty"
    description="Add a visual from the bar above or drop one from Visuals onto the grid, then click it to bind its data"
    :meaning="UiIconMeaning.Chart"
    title="No visuals yet"
    flex-1
  />
  <div v-else ref="canvas" p-3 flex-1>
    <DashboardGrid
      :visuals
      :collision="dashboard.collision"
      :column-number="DASHBOARD_NO_COLUMNS"
      :compact-type="dashboard.compactType"
      :row-height="DASHBOARD_EDITOR_ROW_HEIGHT"
      is-editable
      @commit="commitVisuals($event)"
      @open="openVisual($event)"
      @transfer="transferVisual($event)"
    >
      <template #default="{ visual }">
        <DashboardVisualPreviewContainer
          :visual
          :collision="dashboard.collision"
          :compact-type="dashboard.compactType"
          @commit="commitVisuals($event)"
          @open="openVisual($event)"
          @transfer="transferVisual($event)"
        />
      </template>
    </DashboardGrid>
  </div>
  <DashboardEditorDialogs />
</template>

<style scoped>
/* The grid is the page's background, in the library's tokens */
.dashboard-grid {
  width: 100%;
  min-height: 100%;
  background-color: var(--ui-background);
}
</style>
