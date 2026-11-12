<script setup lang="ts">
import { GesturePhase } from "@/models/whiteboard/GesturePhase";
import { SnapAxis } from "@/models/whiteboard/SnapAxis";
import { WHITEBOARD_OVERLAY_STROKE_WIDTH } from "@/services/whiteboard/overlay/constants";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";

// The guide lines of the alignments a move holds, drawn in the document's coordinates over the elements. The gesture holds them while the drag runs,
// So they clear with its release. An X guide is a vertical line at its position, and a Y guide a horizontal line at its position
const whiteboardEditorStore = useWhiteboardEditorStore();
const { gesture } = storeToRefs(whiteboardEditorStore);
const lines = computed(() =>
  gesture.value?.phase === GesturePhase.Moving
    ? gesture.value.guides.map((guide) =>
        guide.axis === SnapAxis.X
          ? { id: `x-${guide.position}`, x1: guide.position, x2: guide.position, y1: guide.start, y2: guide.end }
          : { id: `y-${guide.position}`, x1: guide.start, x2: guide.end, y1: guide.position, y2: guide.position },
      )
    : [],
);
</script>

<template>
  <line
    v-for="{ id, x1, x2, y1, y2 } in lines"
    :key="id"
    :x1
    :x2
    :y1
    :y2
    stroke="var(--ui-accent)"
    :stroke-width="WHITEBOARD_OVERLAY_STROKE_WIDTH"
    vector-effect="non-scaling-stroke"
  />
</template>
