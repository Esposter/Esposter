<script setup lang="ts">
import type { StrokeElement } from "vue-block-editor-headless";

import { toPathData } from "vue-block-editor-headless";

interface Props {
  stroke: StrokeElement;
}

defineProps<Props>();
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
