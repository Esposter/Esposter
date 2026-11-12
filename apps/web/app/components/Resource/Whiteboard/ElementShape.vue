<script setup lang="ts">
import type { ShapeElement } from "vue-block-editor-headless";

import { getDefaultColor } from "@/services/whiteboard/palette/getDefaultColor";
import { getStrokeAttributes, toShapeOutlinePathData } from "vue-block-editor-headless";

interface Props {
  shape: ShapeElement;
}

const { shape } = defineProps<Props>();
const outline = computed(() => toShapeOutlinePathData(shape));
const attributes = computed(() => getStrokeAttributes(shape, getDefaultColor(shape)));
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
