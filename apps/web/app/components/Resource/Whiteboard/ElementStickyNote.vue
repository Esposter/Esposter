<script setup lang="ts">
import type { StickyNoteElement } from "vue-block-editor-headless";

import { WHITEBOARD_TEXT_COLOR } from "@/services/whiteboard/palette/constants";
import { getBoundsCorners, getStrokeAttributes, toClosedSketchedPathData } from "vue-block-editor-headless";

interface Props {
  stickyNote: StickyNoteElement;
}

const { stickyNote } = defineProps<Props>();
const box = computed(() =>
  toClosedSketchedPathData(getBoundsCorners(stickyNote), stickyNote.id, stickyNote.sketchLevel),
);
const attributes = computed(() => getStrokeAttributes(stickyNote, WHITEBOARD_TEXT_COLOR));
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
