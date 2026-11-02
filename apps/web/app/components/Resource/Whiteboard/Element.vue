<script setup lang="ts">
import type { WhiteboardElement } from "#shared/models/resource/whiteboard/WhiteboardElement";

import { PositionedElementType } from "headless-block-editor";

interface Props {
  element: WhiteboardElement;
}

// One element drawn by its kind, in the order the canvas gives it, so the element list's order is its z-order
const { element } = defineProps<Props>();
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
