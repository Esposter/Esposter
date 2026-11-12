<script setup lang="ts">
import type { StickyNoteElement } from "vue-block-editor-headless";

import { getDefaultColor } from "@/services/whiteboard/palette/getDefaultColor";
import { getBoundsCorners, getStrokeAttributes, toClosedSketchedPathData } from "vue-block-editor-headless";

interface Props {
  stickyNote: StickyNoteElement;
}

const { stickyNote } = defineProps<Props>();
const box = computed(() =>
  toClosedSketchedPathData(getBoundsCorners(stickyNote), stickyNote.id, stickyNote.sketchLevel),
);
const attributes = computed(() => getStrokeAttributes(stickyNote, getDefaultColor(stickyNote)));
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
