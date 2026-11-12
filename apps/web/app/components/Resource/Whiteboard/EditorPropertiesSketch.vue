<script setup lang="ts">
import type { ArrowElement, ShapeElement, StickyNoteElement } from "vue-block-editor-headless";

import { WHITEBOARD_CORNER_STYLE_ITEMS, WHITEBOARD_SKETCH_LEVEL_ITEMS } from "@/services/whiteboard/stroke/constants";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { PositionedElementType, ShapeKind } from "vue-block-editor-headless";

interface Props {
  element: ArrowElement | ShapeElement | StickyNoteElement;
  index: number;
}

// The sketch level of one outline, and for a shape its corners, which an ellipse does not take since it has none. Each one commit
defineProps<Props>();
const whiteboardStore = useWhiteboardStore();
const { updateElementProperty } = whiteboardStore;
</script>

<template>
  <div flex flex-col gap-2>
    <UiToggleGroup
      :model-value="element.sketchLevel"
      label="Sketch"
      :items="WHITEBOARD_SKETCH_LEVEL_ITEMS"
      @update:model-value="(value) => updateElementProperty(index, { property: 'sketchLevel', value })"
    />
    <UiToggleGroup
      v-if="element.type === PositionedElementType.Shape && element.kind !== ShapeKind.Ellipse"
      :model-value="element.cornerStyle"
      label="Corners"
      :items="WHITEBOARD_CORNER_STYLE_ITEMS"
      @update:model-value="(value) => updateElementProperty(index, { property: 'cornerStyle', value })"
    />
  </div>
</template>
