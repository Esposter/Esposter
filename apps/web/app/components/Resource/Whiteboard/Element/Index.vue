<script setup lang="ts">
import type { PositionedElement } from "vue-block-editor-headless";

import { PositionedElementType } from "vue-block-editor-headless";

interface Props {
  element: PositionedElement;
}

// One element drawn by its kind, in the order the canvas gives it, so the element list's order is its z-order
defineProps<Props>();
</script>

<template>
  <ResourceWhiteboardElementArrow v-if="element.type === PositionedElementType.Arrow" :arrow="element" />
  <ResourceWhiteboardElementImage v-else-if="element.type === PositionedElementType.Image" :image="element" />
  <ResourceWhiteboardElementShape v-else-if="element.type === PositionedElementType.Shape" :shape="element" />
  <ResourceWhiteboardElementStickyNote
    v-else-if="element.type === PositionedElementType.StickyNote"
    :sticky-note="element"
  />
  <ResourceWhiteboardElementStroke v-else-if="element.type === PositionedElementType.Stroke" :stroke="element" />
  <ResourceWhiteboardLabel v-else :element />
</template>
