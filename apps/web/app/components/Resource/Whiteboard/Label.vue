<script setup lang="ts">
import type { PositionedElement } from "vue-block-editor-headless";

import {
  getPositionedElementText,
  getTextLayout,
  getTextPlacement,
  TEXT_FONT_FAMILY,
  TEXT_FONT_SIZE,
} from "vue-block-editor-headless";

interface Props {
  element: PositionedElement;
}

const { element } = defineProps<Props>();
const placement = computed(() => getTextPlacement(element));
const labelText = computed(() => getPositionedElementText(element));
// The layout the export sets this text out with, so the editor and the export wrap a label at the same words and put it on the same baseline and line steps
const layout = computed(() =>
  placement.value && labelText.value ? getTextLayout(labelText.value, placement.value) : undefined,
);
</script>

<template>
  <text
    v-if="placement && layout"
    :x="placement.point.x"
    :y="layout.baselineY"
    :text-anchor="placement.textAnchor"
    :font-family="TEXT_FONT_FAMILY"
    :font-size="TEXT_FONT_SIZE"
    fill="currentColor"
  >
    <tspan v-for="({ dy, text }, index) in layout.lines" :key="index" :x="placement.point.x" :dy>{{ text }}</tspan>
  </text>
</template>
