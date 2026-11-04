<script setup lang="ts">
import type { GridGeometry, GridPoint, GridStep } from "vue-grid-layout-headless";

import { getGeometryStyle } from "@/services/dashboard/grid/getGeometryStyle";
import { getKeyStep } from "@/services/dashboard/grid/getKeyStep";
import { takeOne } from "@esposter/shared";
import { ResizeEdge } from "vue-grid-layout-headless";

interface Props {
  geometry: GridGeometry;
  // Takes its height from the content it draws, so the tile is as tall as that content and reports it
  isAutoHeight?: true;
  isDragged: boolean;
  isEditable?: true;
  label: string;
  offset: GridPoint;
}

// A tile is one tab stop of an editable grid. Its eight handles are unpainted hit areas with resize cursors.
// A press on one resizes from that edge or corner, while a press on the rest of the tile moves it. Their paint is an open roadmap item
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
        v-for="edge of edges"
        :key="edge"
        class="dashboard-grid-handle"
        :data-edge="edge"
        @pointerdown.stop="(event) => emit('press', event, edge)"
      />
    </template>
  </div>
</template>

<style scoped>
/* A corner is a square of the handle size, and an edge runs between two corners, so a visual too small for both keeps its
  corners and loses its edges */
.dashboard-grid-tile {
  --dashboard-handle: 0.75rem;

  outline: var(--ui-border-width) solid transparent;
  outline-offset: 0;
}

.dashboard-grid-tile:is(:hover, :focus-visible) {
  outline-color: var(--ui-accent);
}

.dashboard-grid-handle {
  position: absolute;
}

.dashboard-grid-handle[data-edge="North"],
.dashboard-grid-handle[data-edge="South"] {
  left: var(--dashboard-handle);
  right: var(--dashboard-handle);
  height: var(--dashboard-handle);
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
  top: var(--dashboard-handle);
  bottom: var(--dashboard-handle);
  width: var(--dashboard-handle);
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
  width: var(--dashboard-handle);
  height: var(--dashboard-handle);
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
