<script setup lang="ts">
import { GestureTool } from "#src/models/whiteboard/GestureTool";
import { getConnectionHandleItems } from "#src/services/whiteboard/gesture/getConnectionHandleItems";
import { getFreeEndHandleItems } from "#src/services/whiteboard/gesture/getFreeEndHandleItems";
import { getResizeHandlePoint } from "#src/services/whiteboard/gesture/getResizeHandlePoint";
import { getSelectionBounds } from "#src/services/whiteboard/gesture/getSelectionBounds";
import { getSelectionResizeHandles } from "#src/services/whiteboard/gesture/getSelectionResizeHandles";
import {
  WHITEBOARD_HANDLE_SIZE,
  WHITEBOARD_OVERLAY_STROKE_WIDTH,
  WHITEBOARD_SELECTION_PADDING,
} from "#src/services/whiteboard/overlay/constants";
import { useWhiteboardEditorStore } from "#src/store/resource/whiteboard/editor";
import { useWhiteboardStore } from "#src/store/resource/whiteboard/index";
import { getElementBounds } from "vue-block-editor-headless";

// A solid frame in the accent around the box of each selected element, standing off it by a fixed number of screen pixels at any zoom, so it never
// Reads as a second outline on the element's own. Over the frames, each handle the selection takes is drawn as a small square centred on its point
// On the selection's box, so the reader sees where to grab it. The overlay is drawn over the elements as the canvas draws them, so a gesture in
// Progress frames and handles its preview
const whiteboardStore = useWhiteboardStore();
const { displayedDocument } = storeToRefs(whiteboardStore);
const whiteboardEditorStore = useWhiteboardEditorStore();
const { selectedIds, tool, viewport } = storeToRefs(whiteboardEditorStore);
const padding = computed(() => WHITEBOARD_SELECTION_PADDING / viewport.value.scale);
const handleSize = computed(() => WHITEBOARD_HANDLE_SIZE / viewport.value.scale);
// The box of a selection of several, which its handles sit around, and which is framed as an element's box is
const selectionBounds = computed(() => getSelectionBounds(displayedDocument.value, selectedIds.value));
const groupBounds = computed(() => (selectedIds.value.length > 1 ? selectionBounds.value : undefined));
const frames = computed(() => [
  ...displayedDocument.value.elements
    .filter(({ id }) => selectedIds.value.includes(id))
    .map((element) => ({ bounds: getElementBounds(element), key: `element-${element.id}` })),
  ...(groupBounds.value ? [{ bounds: groupBounds.value, key: "group" }] : []),
]);
// The resize, connection and free end handles show on the select tool alone, since a press on them is a select-tool
// Gesture. A bound end and an annotation show none
const isSelectTool = computed(() => tool.value === GestureTool.Select);
const connectionHandles = computed(() =>
  isSelectTool.value ? getConnectionHandleItems(displayedDocument.value, selectedIds.value, viewport.value.scale) : [],
);
const endHandles = computed(() =>
  isSelectTool.value ? getFreeEndHandleItems(displayedDocument.value, selectedIds.value) : [],
);
const handles = computed(() => {
  const bounds = selectionBounds.value;
  if (!isSelectTool.value || bounds === undefined) return [];

  return getSelectionResizeHandles(displayedDocument.value, selectedIds.value).map((handle) => ({
    handle,
    point: getResizeHandlePoint(bounds, handle),
  }));
});
// The resize handles and the free end handles are both squares centred on a point
const squareHandles = computed(() => [
  ...handles.value.map(({ handle, point }) => ({ key: handle, point })),
  ...endHandles.value.map(({ endKey, point }) => ({ key: `end-${endKey}`, point })),
]);
</script>

<template>
  <rect
    v-for="{ bounds, key } in frames"
    :key
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
    v-for="{ key, point } in squareHandles"
    :key
    :x="point.x - handleSize / 2"
    :y="point.y - handleSize / 2"
    :width="handleSize"
    :height="handleSize"
    fill="var(--ui-background)"
    stroke="var(--ui-accent)"
    :stroke-width="WHITEBOARD_OVERLAY_STROKE_WIDTH"
    vector-effect="non-scaling-stroke"
  />
  <circle
    v-for="{ connectionIndex, point } in connectionHandles"
    :key="`connection-${connectionIndex}`"
    :cx="point.x"
    :cy="point.y"
    :r="handleSize / 2"
    fill="var(--ui-background)"
    stroke="var(--ui-accent)"
    :stroke-width="WHITEBOARD_OVERLAY_STROKE_WIDTH"
    vector-effect="non-scaling-stroke"
  />
</template>
