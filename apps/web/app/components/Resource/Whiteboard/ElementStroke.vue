<script setup lang="ts">
import type { StrokeElement } from "headless-block-editor";

import { toPathData } from "headless-block-editor";

interface Props {
  stroke: StrokeElement;
}

const { stroke } = defineProps<Props>();
</script>

<template>
  <path
    :d="toPathData(stroke.points)"
    fill="none"
    stroke="currentColor"
    :stroke-width="stroke.strokeWidth"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
</template>
