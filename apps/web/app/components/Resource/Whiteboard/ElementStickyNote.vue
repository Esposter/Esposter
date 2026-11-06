<script setup lang="ts">
import type { StickyNoteElement } from "vue-block-editor-headless";

import { EXPORT_LINE_WIDTH, getBoundsCorners, toClosedSketchedPathData } from "vue-block-editor-headless";

interface Props {
  stickyNote: StickyNoteElement;
}

const { stickyNote } = defineProps<Props>();
const box = computed(() => toClosedSketchedPathData(getBoundsCorners(stickyNote), stickyNote.id));
</script>

<template>
  <g>
    <path :d="box" :fill="stickyNote.fill" stroke="currentColor" :stroke-width="EXPORT_LINE_WIDTH" />
    <ResourceWhiteboardLabel :element="stickyNote" />
  </g>
</template>
