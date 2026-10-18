<script setup lang="ts">
import type { GridGesture } from "@/models/dashboard/GridGesture";
import type { GridItem } from "@/models/dashboard/GridItem";
import type { GridTile } from "@/models/dashboard/GridTile";
import type { Visual } from "#shared/models/dashboard/data/Visual";

import { GridGestureType } from "@/models/dashboard/GridGestureType";
import { DASHBOARD_GRID_MARGIN } from "@/services/dashboard/constants";
import { compactLayout } from "@/services/dashboard/grid/compactLayout";
import { fitLayout } from "@/services/dashboard/grid/fitLayout";
import { getCellPosition } from "@/services/dashboard/grid/getCellPosition";
import { getCellSize } from "@/services/dashboard/grid/getCellSize";
import { getColumnWidth } from "@/services/dashboard/grid/getColumnWidth";
import { getGestureCell } from "@/services/dashboard/grid/getGestureCell";
import { getLayoutBottom } from "@/services/dashboard/grid/getLayoutBottom";
import { moveItem } from "@/services/dashboard/grid/moveItem";
import { DRAG_START_DISTANCE } from "@/services/ui/constants";
import { checkIsNestedInteraction } from "@esposter/shared";

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
const { width } = useElementSize(grid);
const columnPitch = computed(() => getColumnWidth(width.value, columnNumber) + DASHBOARD_GRID_MARGIN);
const rowPitch = computed(() => rowHeight + DASHBOARD_GRID_MARGIN);
// Each visual at its saved cell, kept within the columns and compacted, so a narrower screen never overlaps
const layout = computed(() =>
  fitLayout(
    visuals.map((visual) => ({ h: visual.h, id: visual.id, visual, w: visual.w, x: visual.x, y: visual.y })),
    columnNumber,
  ),
);
const gesture = shallowRef<GridGesture>();
// The cells as the gesture would leave them, held here until its release so the store is written once
const preview = shallowRef<GridTile[]>();
const idTileMap = computed(() => new Map((preview.value ?? []).map((tile) => [tile.id, tile])));
const draggedGesture = computed(() =>
  gesture.value?.kind === GridGestureType.Move && gesture.value.isStarted ? gesture.value : undefined,
);
const getCellStyle = (cell: GridItem) => ({
  height: `${getCellSize(cell.h, rowPitch.value)}px`,
  left: `${getCellPosition(cell.x, columnPitch.value)}px`,
  top: `${getCellPosition(cell.y, rowPitch.value)}px`,
  width: `${getCellSize(cell.w, columnPitch.value)}px`,
});
// A dragged tile stays under the pointer while the others move aside, so it is drawn from its own cell and offset
const tiles = computed(() =>
  layout.value.map((tile) => {
    const dragged = draggedGesture.value?.origin.id === tile.id ? draggedGesture.value : undefined;
    const cell = dragged ? tile : (idTileMap.value.get(tile.id) ?? tile);
    return {
      style: {
        ...getCellStyle(cell),
        touchAction: isEditable ? "none" : undefined,
        transform: dragged ? `translate(${dragged.offset.x}px, ${dragged.offset.y}px)` : undefined,
        zIndex: dragged ? 1 : undefined,
      },
      tile,
    };
  }),
);
const placeholderStyle = computed(() => {
  if (!gesture.value?.isStarted) return undefined;

  const target = idTileMap.value.get(gesture.value.origin.id);
  return target ? getCellStyle(target) : undefined;
});
const gridStyle = computed(() => ({
  height: `${getCellPosition(getLayoutBottom(preview.value ?? layout.value), rowPitch.value)}px`,
}));
const resetGesture = () => {
  gesture.value = undefined;
  preview.value = undefined;
};

// A press starts a gesture, which becomes a drag only past the start distance, so a press that barely moves stays a click
const startGesture = (event: PointerEvent, tile: GridTile, kind: GridGestureType) => {
  if (!isEditable || checkIsNestedInteraction(event)) return;

  if (event.currentTarget instanceof Element) event.currentTarget.setPointerCapture(event.pointerId);
  gesture.value = {
    isStarted: false,
    kind,
    offset: { x: 0, y: 0 },
    origin: tile,
    pointerId: event.pointerId,
    start: { x: event.clientX, y: event.clientY },
  };
};

useEventListener(grid, "pointermove", (event: PointerEvent) => {
  const activeGesture = gesture.value;
  if (!activeGesture || event.pointerId !== activeGesture.pointerId) return;

  const offset = { x: event.clientX - activeGesture.start.x, y: event.clientY - activeGesture.start.y };
  if (!activeGesture.isStarted && Math.hypot(offset.x, offset.y) < DRAG_START_DISTANCE) return;

  gesture.value = { ...activeGesture, isStarted: true, offset };
  const cell = getGestureCell({
    columnNumber,
    columnPitch: columnPitch.value,
    kind: activeGesture.kind,
    offset,
    origin: activeGesture.origin,
    rowPitch: rowPitch.value,
  });
  preview.value = compactLayout(moveItem(layout.value, cell));
});
// A pointer that is released after a drag writes every cell the drag changed, once, and a press that never started writes nothing
useEventListener(grid, "pointerup", (event: PointerEvent) => {
  if (event.pointerId !== gesture.value?.pointerId) return;

  const changes = (preview.value ?? [])
    .filter((tile) => tile.h !== tile.visual.h || tile.w !== tile.visual.w || tile.x !== tile.visual.x || tile.y !== tile.visual.y)
    .map(({ h, id, w, x, y }) => ({ h, id, w, x, y }));
  resetGesture();
  if (changes.length > 0) emit("commit", changes);
});
useEventListener(grid, "pointercancel", (event: PointerEvent) => {
  if (event.pointerId === gesture.value?.pointerId) resetGesture();
});
</script>

<template>
  <div ref="grid" class="dashboard-grid" relative :style="gridStyle">
    <div
      v-for="{ style, tile } of tiles"
      :key="tile.id"
      class="dashboard-grid-tile"
      absolute
      :style
      @pointerdown="(event) => startGesture(event, tile, GridGestureType.Move)"
    >
      <slot :visual="tile.visual" />
      <span
        v-if="isEditable"
        class="dashboard-grid-handle"
        absolute
        bottom-0
        right-0
        size-4
        cursor="nwse-resize"
        @pointerdown.stop="(event) => startGesture(event, tile, GridGestureType.Resize)"
      />
    </div>
    <div v-if="placeholderStyle" class="dashboard-grid-placeholder" absolute :style="placeholderStyle" />
  </div>
</template>

<style scoped>
/* The corner handle is two borders of the tile's own edge, and the placeholder a tinted cell where a visual will land */
.dashboard-grid-handle {
  border-bottom: 2px solid var(--ui-border);
  border-right: 2px solid var(--ui-border);
}

.dashboard-grid-placeholder {
  background-color: color-mix(in srgb, var(--ui-accent) 20%, transparent);
  border-radius: var(--ui-container-radius);
}
</style>
