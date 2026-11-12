<script setup lang="ts">
import { WHITEBOARD_OVERLAY_STROKE_WIDTH, WHITEBOARD_SELECTION_PADDING } from "@/services/whiteboard/overlay/constants";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { getElementBounds } from "vue-block-editor-headless";

// A solid frame in the accent around the box of each selected element, standing off it by a fixed number of screen pixels at any zoom, so it never
// Reads as a second outline on the element's own. It is drawn over the elements as the canvas draws them, so a gesture in progress frames its preview
const whiteboardStore = useWhiteboardStore();
const { displayedDocument } = storeToRefs(whiteboardStore);
const whiteboardEditorStore = useWhiteboardEditorStore();
const { selectedIds, viewport } = storeToRefs(whiteboardEditorStore);
const padding = computed(() => WHITEBOARD_SELECTION_PADDING / viewport.value.scale);
const frames = computed(() =>
  displayedDocument.value.elements
    .filter(({ id }) => selectedIds.value.includes(id))
    .map((element) => ({ bounds: getElementBounds(element), id: element.id })),
);
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
</template>
