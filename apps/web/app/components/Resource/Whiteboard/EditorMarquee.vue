<script setup lang="ts">
import { GesturePhase } from "@/models/whiteboard/GesturePhase";
import { WHITEBOARD_OVERLAY_DASH_ARRAY } from "@/services/whiteboard/overlay/constants";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { getPointsBounds } from "vue-block-editor-headless";

// The frame of a marquee while it is dragged, over the elements it covers, in the document's coordinates
const whiteboardEditorStore = useWhiteboardEditorStore();
const { gesture } = storeToRefs(whiteboardEditorStore);
const bounds = computed(() =>
  gesture.value?.phase === GesturePhase.Marquee
    ? getPointsBounds([gesture.value.origin, gesture.value.current])
    : undefined,
);
</script>

<template>
  <rect
    v-if="bounds"
    :x="bounds.x"
    :y="bounds.y"
    :width="bounds.width"
    :height="bounds.height"
    fill="none"
    stroke="currentColor"
    :stroke-dasharray="WHITEBOARD_OVERLAY_DASH_ARRAY"
  />
</template>
