<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { DashboardGridTransfer } from "@/models/dashboard/DashboardGridTransfer";
import type { GridBlock } from "vue-grid-layout-headless";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import {
  DASHBOARD_EDITOR_ROW_HEIGHT,
  DASHBOARD_GRID_COMMANDS,
  DASHBOARD_NO_COLUMNS,
} from "@/services/dashboard/constants";
import { findVisual } from "@/services/dashboard/visual/findVisual";
import { getVisualDeleteDescription } from "@/services/dashboard/visual/getVisualDeleteDescription";
import { useDashboardStore } from "@/store/dashboard";
import { useDashboardDialogStore } from "@/store/dashboard/dialog";
import { useVisualStore } from "@/store/dashboard/visual";
import { prettify } from "@/util/text/prettify";

const dashboardStore = useDashboardStore();
const { dashboard } = storeToRefs(dashboardStore);
const visualStore = useVisualStore();
const { visuals } = storeToRefs(visualStore);
const { clearSelection, deleteVisual, editItem, moveVisual, updateVisual } = visualStore;
const dashboardDialogStore = useDashboardDialogStore();
const { deletingVisualId, movingVisualId } = storeToRefs(dashboardDialogStore);
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
// One delete confirm for every tile: a tile's Delete names its visual in the dialog store, and the confirm resolves it
// Here. Resolved through the primitive, so a visual removed while its confirm is open drops the target with it
const { isOpen: isDeleteOpen, item: deletingVisual } = useSingletonDialog(deletingVisualId, () =>
  findVisual(visuals.value, { id: deletingVisualId.value }),
);
// One move dialog for every menu, which names the visual it moves in the dialog store the same way
const { isOpen: isMoveOpen, item: movingVisual } = useSingletonDialog(movingVisualId, () =>
  findVisual(visuals.value, { id: movingVisualId.value }),
);
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
  <!-- Mounted once for the editor, not in each tile: a tile's Delete names its visual in the dialog store, and the confirm opens
    on that. Outside the grid's branch, so a delete that empties the editor still leaves through its transition -->
  <UiConfirmDialog
    v-if="deletingVisual"
    v-model="isDeleteOpen"
    confirm-label="Delete"
    :title="`Delete ${prettify(deletingVisual.type)} visual`"
    :confirm="
      () => {
        if (!deletingVisual) return;

        return deleteVisual({ id: deletingVisual.id });
      }
    "
    is-optimistic
  >
    <p>{{ getVisualDeleteDescription(deletingVisual) }}</p>
  </UiConfirmDialog>
  <DashboardVisualPreviewMoveDialog v-if="movingVisual" v-model="isMoveOpen" :visual="movingVisual" />
</template>

<style scoped>
/* The grid is the page's background, in the library's tokens */
.dashboard-grid {
  width: 100%;
  min-height: 100%;
  background-color: var(--ui-background);
}
</style>
