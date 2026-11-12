<script setup lang="ts">
import { getResizeHandlePoint } from "@/services/whiteboard/gesture/getResizeHandlePoint";
import { getSelectionBounds } from "@/services/whiteboard/gesture/getSelectionBounds";
import { getSelectionResizeHandles } from "@/services/whiteboard/gesture/getSelectionResizeHandles";
import {
  WHITEBOARD_HANDLE_SIZE,
  WHITEBOARD_OVERLAY_STROKE_WIDTH,
  WHITEBOARD_SELECTION_PADDING,
} from "@/services/whiteboard/overlay/constants";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { getElementBounds } from "vue-block-editor-headless";

// A solid frame in the accent around the box of each selected element, standing off it by a fixed number of screen pixels at any zoom, so it never
// Reads as a second outline on the element's own. Over the frames, each handle the selection takes is drawn as a small square centred on its point
// On the selection's box, so the reader sees where to grab it. The overlay is drawn over the elements as the canvas draws them, so a gesture in
// Progress frames and handles its preview
const whiteboardStore = useWhiteboardStore();
const { displayedDocument } = storeToRefs(whiteboardStore);
const whiteboardEditorStore = useWhiteboardEditorStore();
const { selectedIds, viewport } = storeToRefs(whiteboardEditorStore);
const padding = computed(() => WHITEBOARD_SELECTION_PADDING / viewport.value.scale);
const handleSize = computed(() => WHITEBOARD_HANDLE_SIZE / viewport.value.scale);
const frames = computed(() =>
  displayedDocument.value.elements
    .filter(({ id }) => selectedIds.value.includes(id))
    .map((element) => ({ bounds: getElementBounds(element), id: element.id })),
);
// The box of a selection of several, which its handles sit around, and which is framed as an element's box is
const selectionBounds = computed(() => getSelectionBounds(displayedDocument.value, selectedIds.value));
const groupBounds = computed(() => (selectedIds.value.length > 1 ? selectionBounds.value : undefined));
const handles = computed(() => {
  const bounds = selectionBounds.value;
  if (bounds === undefined) return [];

  return getSelectionResizeHandles(displayedDocument.value, selectedIds.value).map((handle) => ({
    handle,
    point: getResizeHandlePoint(bounds, handle),
  }));
});
</script>

<template>
  <rect
    v-for="{ bounds, id } in frames"
    :key="id"
    :x="bounds.x - padding"
    :y="bounds.y - padding"
    :width="bounds.width + 2 * padding"
    :height="bounds.height + 2 * padding"
    fill="none"
    stroke="var(--ui-accent)"
    :stroke-width="WHITEBOARD_OVERLAY_STROKE_WIDTH"
    vector-effect="non-scaling-stroke"
  />
  <rect
    v-if="groupBounds"
    :x="groupBounds.x - padding"
    :y="groupBounds.y - padding"
    :width="groupBounds.width + 2 * padding"
    :height="groupBounds.height + 2 * padding"
    fill="none"
    stroke="var(--ui-accent)"
    :stroke-width="WHITEBOARD_OVERLAY_STROKE_WIDTH"
    vector-effect="non-scaling-stroke"
  />
  <rect
    v-for="{ handle, point } in handles"
    :key="handle"
    :x="point.x - handleSize / 2"
    :y="point.y - handleSize / 2"
    :width="handleSize"
    :height="handleSize"
    fill="var(--ui-background)"
    stroke="var(--ui-accent)"
    :stroke-width="WHITEBOARD_OVERLAY_STROKE_WIDTH"
    vector-effect="non-scaling-stroke"
  />
</template>
