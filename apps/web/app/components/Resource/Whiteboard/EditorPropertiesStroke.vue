<script setup lang="ts">
import type {
  ArrowElement,
  ShapeElement,
  StickyNoteElement,
  StrokeElement,
  TextElement,
} from "vue-block-editor-headless";

import { WHITEBOARD_DASH_PATTERN_ITEMS, WHITEBOARD_STROKE_WIDTH_ITEMS } from "@/services/whiteboard/stroke/constants";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { PositionedElementType } from "vue-block-editor-headless";

interface Props {
  element: ArrowElement | ShapeElement | StickyNoteElement | StrokeElement | TextElement;
  index: number;
}

// The colour, width and dash pattern of one element, each one commit. A text box takes a colour alone, a freehand stroke a colour and a width,
// And a shape, a sticky note or an arrow all three. The clear control returns the colour to the page's text colour
defineProps<Props>();
const whiteboardStore = useWhiteboardStore();
const { updateElementProperty } = whiteboardStore;
</script>

<template>
  <div flex flex-col gap-2>
    <UiColorField
      :model-value="element.color"
      label="Colour"
      @update:model-value="(value) => updateElementProperty(index, { property: 'color', value })"
    />
    <UiButton :disabled="!element.color" @click="updateElementProperty(index, { property: 'color', value: '' })">
      Clear colour
    </UiButton>
    <UiToggleGroup
      v-if="element.type !== PositionedElementType.Text"
      :model-value="element.strokeWidth"
      label="Width"
      :items="WHITEBOARD_STROKE_WIDTH_ITEMS"
      @update:model-value="(value) => updateElementProperty(index, { property: 'strokeWidth', value })"
    />
    <UiToggleGroup
      v-if="
        element.type === PositionedElementType.Arrow ||
        element.type === PositionedElementType.Shape ||
        element.type === PositionedElementType.StickyNote
      "
      :model-value="element.dashPattern"
      label="Dash pattern"
      :items="WHITEBOARD_DASH_PATTERN_ITEMS"
      @update:model-value="(value) => updateElementProperty(index, { property: 'dashPattern', value })"
    />
  </div>
</template>
