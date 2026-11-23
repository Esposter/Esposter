<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { Dataset } from "#shared/models/dataset/Dataset";
import type { Item } from "#src/models/shared/Item";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { exportDashboardVisualCsv } from "#src/services/dashboard/export/exportDashboardVisualCsv";
import { getVisualMoveTargets } from "#src/services/dashboard/visual/getVisualMoveTargets";
import { getEditDeleteItems } from "#src/services/ui/getEditDeleteItems";
import { useDashboardDialogStore } from "#src/store/dashboard/dialog";
import { useVisualStore } from "#src/store/dashboard/visual";

interface Props {
  // A bound visual that draws its rows has a dataset to export, and a demo or failed one has none
  dataset?: Dataset | undefined;
  visual: Visual;
}

const { dataset, visual } = defineProps<Props>();
const visualStore = useVisualStore();
const { duplicateVisual, editItem, setAutoHeight } = visualStore;
const { visuals } = storeToRefs(visualStore);
const dashboardDialogStore = useDashboardDialogStore();
const { deletingVisualId, movingVisualId } = storeToRefs(dashboardDialogStore);
const moveTargets = computed(() => getVisualMoveTargets(visuals.value, visual.id));
const [editVisualItem, deleteVisualItem] = getEditDeleteItems({
  deleteLabel: "Delete visual",
  editLabel: "Edit visual",
  onDelete: () => {
    deletingVisualId.value = visual.id;
  },
  onEdit: () => {
    editItem({ id: visual.id });
  },
});
// The visual's occasional actions, each a row the menu lists. Fit height is offered for a table, whose rows set its
// Height, And for a group, whose height is the rows its grid takes. Move to is offered only where the visual has
// Somewhere to go
const items = computed<Item[]>(() => [
  editVisualItem,
  {
    meaning: UiIconMeaning.Copy,
    onClick: () => {
      duplicateVisual({ id: visual.id });
    },
    title: "Duplicate visual",
  },
  ...(dataset
    ? [
        {
          meaning: UiIconMeaning.Download,
          onClick: () => exportDashboardVisualCsv(visual, dataset),
          title: "Export CSV",
        },
      ]
    : []),
  ...(visual.type === VisualType.Table || visual.type === VisualType.Group
    ? [
        {
          isSelected: visual.isAutoHeight,
          meaning: UiIconMeaning.FitToContent,
          onClick: () => {
            setAutoHeight({ id: visual.id }, !visual.isAutoHeight);
          },
          title: "Fit height to content",
        },
      ]
    : []),
  ...(moveTargets.value.length > 0
    ? [
        {
          meaning: UiIconMeaning.Drag,
          onClick: () => {
            movingVisualId.value = visual.id;
          },
          title: "Move to…",
        },
      ]
    : []),
  { ...deleteVisualItem, isGroupStart: true },
]);
</script>

<template>
  <UiOverflowMenu :items label="Visual actions" />
</template>
