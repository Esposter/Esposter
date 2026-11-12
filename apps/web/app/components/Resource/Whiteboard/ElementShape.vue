<script setup lang="ts">
import type { ShapeElement } from "vue-block-editor-headless";

import { getElementStrokeAttributes } from "@/services/whiteboard/palette/getElementStrokeAttributes";
import { toShapeOutlinePathData } from "vue-block-editor-headless";

interface Props {
  shape: ShapeElement;
}

const { shape } = defineProps<Props>();
const outline = computed(() => toShapeOutlinePathData(shape));
const attributes = computed(() => getElementStrokeAttributes(shape));
</script>

<template>
  <g>
    <path
      :d="outline"
      :fill="shape.fill || 'none'"
      :stroke="attributes.stroke"
      :stroke-width="attributes.strokeWidth"
      :stroke-dasharray="attributes.strokeDasharray"
      :stroke-linecap="attributes.strokeLinecap"
    />
    <ResourceWhiteboardLabel :element="shape" />
  </g>
</template>
