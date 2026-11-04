<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { DashboardVisualEmits } from "@/models/dashboard/DashboardVisualEmits";
import type { CollisionMode, CompactType } from "vue-grid-layout-headless";

import { VisualType } from "#shared/models/dashboard/data/VisualType";
import { DASHBOARD_GRID_MARGIN } from "@/services/dashboard/constants";
import { getGeometryStyle } from "@/services/dashboard/grid/getGeometryStyle";
import { checkIsMoveRefused } from "@/services/dashboard/visual/checkIsMoveRefused";
import { DRAG_START_DISTANCE } from "@/services/ui/constants";
import { useVisualStore } from "@/store/dashboard/visual";
import { prettify } from "@/util/text/prettify";
import { useGridLayout } from "vue-grid-layout-headless";

interface Props {
  collision: CollisionMode;
  columnNumber: number;
  compactType: CompactType;
  isEditable?: true;
  rowHeight: number;
  visuals: Visual[];
}

defineSlots<{ default: (props: { visual: Visual }) => unknown }>();
const { collision, columnNumber, compactType, isEditable, rowHeight, visuals } = defineProps<Props>();
const emit = defineEmits<DashboardVisualEmits>();
const grid = useTemplateRef("grid");
const visualStore = useVisualStore();
const { visuals: dashboardVisuals } = storeToRefs(visualStore);
const { gridHeight, placeholder, reportContentHeight, startGesture, stepItem, tiles } = useGridLayout(grid, () => ({
  // A body drag is refused by the group it is dropped on when the move would put the visual in itself or nest it past the cap
  checkIsRefused: (item, target) => checkIsMoveRefused(dashboardVisuals.value, item.id, target.dataset.groupId),
  // A group is solid in the grid it sits in, so no other visual's drag pushes it: a landing over it is refused, and a visual
  // Joins the group by its body alone
  checkIsSolid: (visual) => visual.type === VisualType.Group,
  collision,
  columnNumber,
  compactType,
  dragStartDistance: DRAG_START_DISTANCE,
  isEditable: isEditable === true,
  items: visuals,
  onCommit: ({ changes }) => emit("commit", changes),
  // A group's grid reads its group from its own data-group-id, and the dashboard's own grid has none
  onTransfer: (transfer) =>
    emit("transfer", { cell: transfer.cell, id: transfer.item.id, targetGroupId: transfer.target.dataset.groupId }),
  rowHeight,
  spacing: { gap: DASHBOARD_GRID_MARGIN, padding: DASHBOARD_GRID_MARGIN },
}));
</script>

<template>
  <div ref="grid" class="dashboard-grid" relative :style="{ height: `${gridHeight}px` }">
    <DashboardGridTile
      v-for="{ geometry, isDragged, item, offset } of tiles"
      :key="item.id"
      :geometry
      :is-auto-height="item.isAutoHeight"
      :is-dragged
      :is-editable
      :label="`${prettify(item.type)} visual`"
      :offset
      @measure="(height) => reportContentHeight(item.id, height)"
      @open="emit('open', item)"
      @press="(event, edge) => startGesture(event, item, edge)"
      @step="(step) => stepItem(item.id, step)"
    >
      <slot :visual="item" />
    </DashboardGridTile>
    <div
      v-if="placeholder"
      class="dashboard-grid-placeholder"
      pointer-events-none
      absolute
      :data-refused="placeholder.isRefused || undefined"
      :style="getGeometryStyle(placeholder.geometry, false)"
    />
  </div>
</template>

<style scoped>
/* The grid is the page's background; a placeholder is a tinted cell where a visual will land, and an error-tinted one where
  the grid would refuse the drop. It takes no pointer, so the grid and group under it are the ones a drag targets */
.dashboard-grid-placeholder {
  background-color: color-mix(in srgb, var(--ui-accent) 20%, transparent);
  border-radius: var(--ui-container-radius);
}

.dashboard-grid-placeholder[data-refused] {
  background-color: color-mix(in srgb, var(--ui-error) 20%, transparent);
}
</style>
