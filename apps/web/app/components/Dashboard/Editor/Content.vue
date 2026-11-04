<script setup lang="ts">
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { DASHBOARD_EDITOR_ROW_HEIGHT, DASHBOARD_NO_COLUMNS } from "@/services/dashboard/constants";
import { useDashboardStore } from "@/store/dashboard";
import { useDashboardDialogStore } from "@/store/dashboard/dialog";
import { useVisualStore } from "@/store/dashboard/visual";
import { prettify } from "@/util/text/prettify";

const dashboardStore = useDashboardStore();
const { dashboard } = storeToRefs(dashboardStore);
const visualStore = useVisualStore();
const { editedItem, visuals } = storeToRefs(visualStore);
const { deleteVisual, editItem, updateVisual } = visualStore;
const dashboardDialogStore = useDashboardDialogStore();
const { deletingVisualId } = storeToRefs(dashboardDialogStore);
// One delete confirm for every tile: a tile's Delete names its visual in the dialog store, and the confirm resolves it
// Here. Resolved through the primitive, so a visual removed while its confirm is open drops the target with it
const { isOpen: isDeleteOpen, item: deletingVisual } = useSingletonDialog(deletingVisualId, () =>
  visuals.value.find(({ id }) => id === deletingVisualId.value),
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
      @commit="
        (changes) => {
          for (const change of changes) updateVisual(change);
        }
      "
      @open="(visual) => editItem({ id: visual.id })"
    >
      <template #default="{ visual }">
        <DashboardVisualPreviewContainer
          size-full
          cursor-pointer
          ui-frame
          active="not-focus-within:[background-image:var(--ui-pressed-overlay)]"
          :visual
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
    <p>Delete this visual from the dashboard?</p>
  </UiConfirmDialog>
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
