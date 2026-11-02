<script setup lang="ts">
import type { ShapeElement } from "headless-block-editor";

import { EXPORT_LINE_WIDTH, getShapeOutline, toClosedSketchedPathData } from "headless-block-editor";

interface Props {
  shape: ShapeElement;
}

const { shape } = defineProps<Props>();
const outline = computed(() => toClosedSketchedPathData(getShapeOutline(shape), shape.id));
</script>

<template>
  <g>
    <path :d="outline" :fill="shape.fill" stroke="currentColor" :stroke-width="EXPORT_LINE_WIDTH" />
    <ResourceWhiteboardLabel :element="shape" />
  </g>
</template>
