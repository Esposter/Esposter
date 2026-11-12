<script setup lang="ts">
import type { StrokeElement } from "vue-block-editor-headless";

import { WHITEBOARD_TEXT_COLOR } from "@/services/whiteboard/palette/constants";
import { getStrokeAttributes, toPathData } from "vue-block-editor-headless";

interface Props {
  stroke: StrokeElement;
}

const { stroke } = defineProps<Props>();
const attributes = computed(() => getStrokeAttributes(stroke, WHITEBOARD_TEXT_COLOR));
</script>

<template>
  <path
    :d="toPathData(stroke.points)"
    fill="none"
    :stroke="attributes.stroke"
    :stroke-width="attributes.strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</template>
