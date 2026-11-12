<script setup lang="ts">
import { GesturePhase } from "@/models/whiteboard/GesturePhase";
import {
  WHITEBOARD_MARQUEE_FILL_OPACITY,
  WHITEBOARD_OVERLAY_STROKE_WIDTH,
} from "@/services/whiteboard/overlay/constants";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { getPointsBounds } from "vue-block-editor-headless";

// The frame of a marquee while it is dragged, over the elements it covers, in the document's coordinates: a thin solid border in the accent around a
// Faint tint of it, as a selection box is drawn, with no dashes that would read against the outlines under it
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
    fill="var(--ui-accent)"
    :fill-opacity="WHITEBOARD_MARQUEE_FILL_OPACITY"
    stroke="var(--ui-accent)"
    :stroke-width="WHITEBOARD_OVERLAY_STROKE_WIDTH"
    vector-effect="non-scaling-stroke"
  />
</template>
