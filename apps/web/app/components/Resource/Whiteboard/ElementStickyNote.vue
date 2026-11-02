<script setup lang="ts">
import type { StickyNoteElement } from "headless-block-editor";

import { EXPORT_LINE_WIDTH, getBoundsCorners, toClosedSketchedPathData } from "headless-block-editor";

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
