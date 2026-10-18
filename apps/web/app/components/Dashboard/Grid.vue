<script setup lang="ts">
import type { Visual } from "#shared/models/dashboard/data/Visual";
import type { GridGeometry, GridItem } from "vue-grid-layout-headless";

import { DASHBOARD_GRID_MARGIN } from "@/services/dashboard/constants";
import { DRAG_START_DISTANCE } from "@/services/ui/constants";
import { GridGestureType, useGridLayout } from "vue-grid-layout-headless";

defineSlots<{ default: (props: { visual: Visual }) => unknown }>();

interface Props {
  columnNumber: number;
  isEditable?: true;
  rowHeight: number;
  visuals: Visual[];
}

const { columnNumber, isEditable, rowHeight, visuals } = defineProps<Props>();
const emit = defineEmits<{ commit: [changes: GridItem[]] }>();
const grid = useTemplateRef("grid");
const items = computed(() =>
  visuals.map((visual) => ({ h: visual.h, id: visual.id, visual, w: visual.w, x: visual.x, y: visual.y })),
);
const { gridHeight, placeholder, startGesture, tiles } = useGridLayout(grid, () => ({
  columnNumber,
  dragStartDistance: DRAG_START_DISTANCE,
  isEditable: isEditable === true,
  items: items.value,
  onCommit: (changes) => emit("commit", changes),
  rowHeight,
  spacing: { gap: DASHBOARD_GRID_MARGIN, padding: DASHBOARD_GRID_MARGIN },
}));
const getBoxStyle = (geometry: GridGeometry) => ({
  height: `${geometry.height}px`,
  left: `${geometry.left}px`,
  top: `${geometry.top}px`,
  width: `${geometry.width}px`,
});
</script>

<template>
  <div ref="grid" class="dashboard-grid" relative :style="{ height: `${gridHeight}px` }">
    <div
      v-for="{ geometry, isDragged, item, offset } of tiles"
      :key="item.id"
      class="dashboard-grid-tile"
      absolute
      :style="{
        ...getBoxStyle(geometry),
        touchAction: isEditable ? 'none' : undefined,
        transform: isDragged ? `translate(${offset.x}px, ${offset.y}px)` : undefined,
        zIndex: isDragged ? 1 : undefined,
      }"
      @pointerdown="(event) => startGesture(event, item, GridGestureType.Move)"
    >
      <slot :visual="item.visual" />
      <span
        v-if="isEditable"
        class="dashboard-grid-handle"
        absolute
        bottom-0
        right-0
        size-4
        cursor="nwse-resize"
        @pointerdown.stop="(event) => startGesture(event, item, GridGestureType.Resize)"
      />
    </div>
    <div v-if="placeholder" class="dashboard-grid-placeholder" absolute :style="getBoxStyle(placeholder)" />
  </div>
</template>

<style scoped>
/* The corner handle is two borders of the tile's own edge, and the placeholder a tinted cell where a visual will land */
.dashboard-grid-handle {
  border-bottom: var(--ui-border-width) solid var(--ui-border);
  border-right: var(--ui-border-width) solid var(--ui-border);
}

.dashboard-grid-placeholder {
  background-color: color-mix(in srgb, var(--ui-accent) 20%, transparent);
  border-radius: var(--ui-container-radius);
}
</style>
