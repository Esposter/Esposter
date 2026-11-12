<script setup lang="ts">
import type { ArrowElement } from "vue-block-editor-headless";

import { WHITEBOARD_TEXT_COLOR } from "@/services/whiteboard/palette/constants";
import {
  getArrowheads,
  getArrowRoute,
  getStrokeAttributes,
  toPolygonPoints,
  toSketchedPathData,
} from "vue-block-editor-headless";

interface Props {
  arrow: ArrowElement;
}

const { arrow } = defineProps<Props>();
const route = computed(() => getArrowRoute(arrow));
const path = computed(() => toSketchedPathData(route.value, arrow.id, arrow.sketchLevel));
const arrowheads = computed(() => getArrowheads(arrow, route.value).map((points) => toPolygonPoints(points)));
const attributes = computed(() => getStrokeAttributes(arrow, WHITEBOARD_TEXT_COLOR));
</script>

<template>
  <g v-if="route.length > 1">
    <path
      :d="path"
      fill="none"
      :stroke="attributes.stroke"
      :stroke-width="attributes.strokeWidth"
      :stroke-dasharray="attributes.strokeDasharray"
      :stroke-linecap="attributes.strokeLinecap"
    />
    <polygon v-for="(points, index) in arrowheads" :key="index" :points :fill="attributes.stroke" />
    <ResourceWhiteboardLabel :element="arrow" />
  </g>
</template>
