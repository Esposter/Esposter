<script setup lang="ts">
import { findVisual } from "#src/services/dashboard/visual/findVisual";
import { getVisualDeleteDescription } from "#src/services/dashboard/visual/getVisualDeleteDescription";
import { useDashboardDialogStore } from "#src/store/dashboard/dialog";
import { useVisualStore } from "#src/store/dashboard/visual";
import { prettify } from "#src/util/text/prettify";

const visualStore = useVisualStore();
const { deleteVisual } = visualStore;
const { visuals } = storeToRefs(visualStore);
const dashboardDialogStore = useDashboardDialogStore();
const { deletingVisualId, movingVisualId } = storeToRefs(dashboardDialogStore);
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
  >
    <p>{{ getVisualDeleteDescription(deletingVisual) }}</p>
  </UiConfirmDialog>
  <DashboardVisualPreviewMoveDialog v-if="movingVisual" v-model="isMoveOpen" :visual="movingVisual" />
</template>
