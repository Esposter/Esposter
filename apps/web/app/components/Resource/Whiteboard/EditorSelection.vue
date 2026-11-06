<script setup lang="ts">
import { WHITEBOARD_OVERLAY_DASH_ARRAY } from "@/services/whiteboard/overlay/constants";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { getElementBounds } from "vue-block-editor-headless";

// A dashed frame around the box of each selected element, drawn over the elements as the canvas draws them, so a gesture in progress frames its preview
const whiteboardStore = useWhiteboardStore();
const { displayedDocument } = storeToRefs(whiteboardStore);
const whiteboardEditorStore = useWhiteboardEditorStore();
const { selectedIds } = storeToRefs(whiteboardEditorStore);
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
    :x="bounds.x"
    :y="bounds.y"
    :width="bounds.width"
    :height="bounds.height"
    fill="none"
    stroke="currentColor"
    :stroke-dasharray="WHITEBOARD_OVERLAY_DASH_ARRAY"
  />
</template>
