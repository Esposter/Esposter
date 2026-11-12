<script setup lang="ts">
import type { StickyNoteElement } from "vue-block-editor-headless";

import { getElementStrokeAttributes } from "@/services/whiteboard/palette/getElementStrokeAttributes";
import { getBoundsCorners, toClosedSketchedPathData } from "vue-block-editor-headless";

interface Props {
  stickyNote: StickyNoteElement;
}

const { stickyNote } = defineProps<Props>();
const box = computed(() =>
  toClosedSketchedPathData(getBoundsCorners(stickyNote), stickyNote.id, stickyNote.sketchLevel),
);
const attributes = computed(() => getElementStrokeAttributes(stickyNote));
</script>

<template>
  <g>
    <path
      :d="box"
      :fill="stickyNote.fill"
      :stroke="attributes.stroke"
      :stroke-width="attributes.strokeWidth"
      :stroke-dasharray="attributes.strokeDasharray"
      :stroke-linecap="attributes.strokeLinecap"
    />
    <ResourceWhiteboardLabel :element="stickyNote" />
  </g>
</template>
