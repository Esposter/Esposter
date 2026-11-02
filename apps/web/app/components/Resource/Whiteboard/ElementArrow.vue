<script setup lang="ts">
import type { ArrowElement } from "headless-block-editor";

import {
  EXPORT_LINE_WIDTH,
  getArrowheads,
  getArrowRoute,
  toPolygonPoints,
  toSketchedPathData,
} from "headless-block-editor";

interface Props {
  arrow: ArrowElement;
}

const { arrow } = defineProps<Props>();
const route = computed(() => getArrowRoute(arrow));
const path = computed(() => toSketchedPathData(route.value, arrow.id));
const arrowheads = computed(() => getArrowheads(arrow, route.value).map((points) => toPolygonPoints(points)));
</script>

<template>
  <g v-if="route.length > 1">
    <path :d="path" fill="none" stroke="currentColor" :stroke-width="EXPORT_LINE_WIDTH" />
    <polygon v-for="(points, index) in arrowheads" :key="index" :points fill="currentColor" />
    <ResourceWhiteboardLabel :element="arrow" />
  </g>
</template>
