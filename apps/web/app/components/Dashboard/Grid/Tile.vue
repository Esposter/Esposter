<script setup lang="ts">
import type { GridGeometry, GridPoint, GridStep } from "vue-grid-layout-headless";

import { getGeometryStyle } from "@/services/dashboard/grid/getGeometryStyle";
import { getKeyStep } from "@/services/dashboard/grid/getKeyStep";
import { takeOne } from "@esposter/shared";
import { ResizeEdge } from "vue-grid-layout-headless";

interface Props {
  geometry: GridGeometry;
  // Takes its height from the content it draws, so the tile is as tall as that content and reports it, and it resizes its width only
  isAutoHeight: boolean;
  isDragged: boolean;
  isEditable?: true;
  label: string;
  offset: GridPoint;
}

// A tile is one tab stop of an editable grid. Its eight handles are unpainted hit areas with resize cursors.
// A press on one resizes from that edge or corner, while a press on the rest of the tile moves it. A touch on a handle
// Moves the tile too, since resizing is not a touch gesture. They stay unpainted by decision: the outline and cursor show them
defineSlots<{ default: () => VNode }>();
const { geometry, isAutoHeight, isDragged, isEditable, label, offset } = defineProps<Props>();
const emit = defineEmits<{
  measure: [height: number];
  open: [];
  press: [event: PointerEvent, edge?: ResizeEdge];
  step: [step: GridStep];
}>();
const tile = useTemplateRef("tile");
const edges = Object.values(ResizeEdge);
// An auto-height tile's height is its content's, so only the handles that move its sides are drawn for it
const widthEdges = [ResizeEdge.East, ResizeEdge.West];
useResizeObserver(tile, (entries) => {
  if (!isAutoHeight) return;

  const entry = takeOne(entries);
  emit("measure", entry.contentRect.height);
});
</script>

<template>
  <div
    ref="tile"
    class="dashboard-grid-tile"
    absolute
    :aria-label="isEditable ? label : undefined"
    :data-editable="isEditable || undefined"
    :role="isEditable ? 'group' : undefined"
    :tabindex="isEditable ? 0 : undefined"
    :style="{
      ...getGeometryStyle(geometry, isAutoHeight),
      touchAction: isEditable ? 'none' : undefined,
      transform: isDragged ? `translate(${offset.x}px, ${offset.y}px)` : undefined,
      zIndex: isDragged ? 1 : undefined,
    }"
    @keydown="
      (event) => {
        // A key pressed on a control inside the visual is that control's, so only the tile's own focus takes it
        if (!isEditable || event.target !== event.currentTarget) return;

        if (event.key === 'Enter') {
          emit('open');
          return;
        }
        const step = getKeyStep(event);
        if (!step) return;

        event.preventDefault();
        emit('step', step);
      }
    "
    @pointerdown="(event) => emit('press', event)"
  >
    <slot />
    <template v-if="isEditable">
      <span
        v-for="edge of isAutoHeight ? widthEdges : edges"
        :key="edge"
        class="dashboard-grid-handle"
        :data-edge="edge"
        @pointerdown.stop="(event) => emit('press', event, event.pointerType === 'touch' ? undefined : edge)"
      />
    </template>
  </div>
</template>

<style scoped>
/* A handle is the handle size, capped at a third of the tile in each axis, so the two corners of a one-column tile never
  overlap. A corner is a square of that size, and an edge runs between two corners, so a visual too small for both keeps its
  corners and loses its edges. The percentage resolves against the tile's width for a width and its height for a height */
.dashboard-grid-tile {
  --dashboard-handle: 0.75rem;
  --dashboard-cap: min(var(--dashboard-handle), 33%);

  outline: var(--ui-border-width) solid transparent;
  outline-offset: 0;
}

/* An editable visual outlines in the accent when the pointer is over it or focus is within it. The outline is drawn beyond the
  border box, so the layout does not move */
.dashboard-grid-tile[data-editable]:is(:hover, :focus-within) {
  outline-color: var(--ui-accent);
}

.dashboard-grid-handle {
  position: absolute;
}

.dashboard-grid-handle[data-edge="North"],
.dashboard-grid-handle[data-edge="South"] {
  left: var(--dashboard-cap);
  right: var(--dashboard-cap);
  height: var(--dashboard-cap);
  cursor: ns-resize;
}

.dashboard-grid-handle[data-edge="North"] {
  top: 0;
}

.dashboard-grid-handle[data-edge="South"] {
  bottom: 0;
}

.dashboard-grid-handle[data-edge="East"],
.dashboard-grid-handle[data-edge="West"] {
  top: var(--dashboard-cap);
  bottom: var(--dashboard-cap);
  width: var(--dashboard-cap);
  cursor: ew-resize;
}

.dashboard-grid-handle[data-edge="East"] {
  right: 0;
}

.dashboard-grid-handle[data-edge="West"] {
  left: 0;
}

.dashboard-grid-handle[data-edge="NorthWest"],
.dashboard-grid-handle[data-edge="NorthEast"],
.dashboard-grid-handle[data-edge="SouthWest"],
.dashboard-grid-handle[data-edge="SouthEast"] {
  width: var(--dashboard-cap);
  height: var(--dashboard-cap);
}

.dashboard-grid-handle[data-edge="NorthWest"] {
  top: 0;
  left: 0;
  cursor: nwse-resize;
}

.dashboard-grid-handle[data-edge="NorthEast"] {
  top: 0;
  right: 0;
  cursor: nesw-resize;
}

.dashboard-grid-handle[data-edge="SouthWest"] {
  bottom: 0;
  left: 0;
  cursor: nesw-resize;
}

.dashboard-grid-handle[data-edge="SouthEast"] {
  bottom: 0;
  right: 0;
  cursor: nwse-resize;
}
</style>
