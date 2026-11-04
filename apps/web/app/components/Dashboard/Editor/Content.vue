<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { DashboardGridTransfer } from "@/models/dashboard/DashboardGridTransfer";
import type { GridBlock } from "vue-grid-layout-headless";

import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { DASHBOARD_EDITOR_ROW_HEIGHT, DASHBOARD_NO_COLUMNS } from "@/services/dashboard/constants";
import { findVisual } from "@/services/dashboard/visual/findVisual";
import { getVisualDeleteDescription } from "@/services/dashboard/visual/getVisualDeleteDescription";
import { useDashboardStore } from "@/store/dashboard";
import { useDashboardDialogStore } from "@/store/dashboard/dialog";
import { useVisualStore } from "@/store/dashboard/visual";
import { prettify } from "@/util/text/prettify";

const dashboardStore = useDashboardStore();
const { dashboard } = storeToRefs(dashboardStore);
const visualStore = useVisualStore();
const { editedItem, visuals } = storeToRefs(visualStore);
const { deleteVisual, editItem, moveVisual, updateVisual } = visualStore;
const dashboardDialogStore = useDashboardDialogStore();
const { deletingVisualId, movingVisualId } = storeToRefs(dashboardDialogStore);
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
    v-if="visuals.length === 0"
    description="Add a visual from the bar above or drop one from Visuals onto the grid, then click it to bind its data"
    :meaning="UiIconMeaning.Chart"
    title="No visuals yet"
    flex-1
  />
  <div v-else p-3 flex-1>
    <DashboardGrid
      :visuals
      :collision="dashboard.collision"
      :column-number="DASHBOARD_NO_COLUMNS"
      :compact-type="dashboard.compactType"
      :row-height="DASHBOARD_EDITOR_ROW_HEIGHT"
      is-editable
      @commit="(changes) => commitVisuals(changes)"
      @open="(visual) => openVisual(visual)"
      @transfer="(transfer) => transferVisual(transfer)"
    >
      <template #default="{ visual }">
        <DashboardVisualPreviewContainer
          :visual
          :collision="dashboard.collision"
          :compact-type="dashboard.compactType"
          @commit="(changes) => commitVisuals(changes)"
          @open="(openedVisual) => openVisual(openedVisual)"
          @transfer="(transfer) => transferVisual(transfer)"
        />
      </template>
    </DashboardGrid>
  </div>
  <!-- Mounted once for the editor, not in each tile: a tile's Delete names its visual in the dialog store and its Edit sets
    the edited draft, and these open on that. Outside the grid's branch, so a delete that empties the editor still leaves
    through its transition -->
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
  <DashboardVisualPreviewEditFormDialog v-if="editedItem" :key="editedItem.id" v-model="editedItem" />
</template>

<style scoped>
/* The grid is the page's background, in the library's tokens */
.dashboard-grid {
  width: 100%;
  min-height: 100%;
  background-color: var(--ui-background);
}
</style>
