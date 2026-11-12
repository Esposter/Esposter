<script setup lang="ts">
import type { ArrowElement, ShapeElement, StickyNoteElement, TextElement } from "vue-block-editor-headless";

import {
  WHITEBOARD_HORIZONTAL_ALIGNMENT_ITEMS,
  WHITEBOARD_TEXT_SIZE_ITEMS,
  WHITEBOARD_VERTICAL_ALIGNMENT_ITEMS,
} from "@/services/whiteboard/text/constants";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { getHorizontalAlignment, getVerticalAlignment, PositionedElementType } from "vue-block-editor-headless";

interface Props {
  element: ArrowElement | ShapeElement | StickyNoteElement | TextElement;
  index: number;
}

// The text controls of one element: its size, which every text takes, and for a shape, a sticky note or a text box its horizontal alignment, a shape's
// Or sticky note's vertical alignment, and a text box's auto width. An arrow's label takes its size alone. Each one commit
defineProps<Props>();
const whiteboardStore = useWhiteboardStore();
const { updateElementProperty } = whiteboardStore;
</script>

<template>
  <div flex flex-col gap-2>
    <UiToggleGroup
      :model-value="element.textSize"
      label="Text size"
      :items="WHITEBOARD_TEXT_SIZE_ITEMS"
      @update:model-value="(value) => updateElementProperty(index, { property: 'textSize', value })"
    />
    <UiToggleGroup
      v-if="element.type !== PositionedElementType.Arrow"
      :model-value="getHorizontalAlignment(element)"
      label="Align"
      :items="WHITEBOARD_HORIZONTAL_ALIGNMENT_ITEMS"
      @update:model-value="(value) => updateElementProperty(index, { property: 'horizontalAlignment', value })"
    />
    <UiToggleGroup
      v-if="element.type === PositionedElementType.Shape || element.type === PositionedElementType.StickyNote"
      :model-value="getVerticalAlignment(element)"
      label="Vertical align"
      :items="WHITEBOARD_VERTICAL_ALIGNMENT_ITEMS"
      @update:model-value="(value) => updateElementProperty(index, { property: 'verticalAlignment', value })"
    />
    <UiCheckbox
      v-if="element.type === PositionedElementType.Text"
      :model-value="!element.isWrapped"
      is-label-shown
      label="Auto width"
      @update:model-value="
        (isAutoWidth) => updateElementProperty(index, { property: 'isWrapped', value: !isAutoWidth })
      "
    />
  </div>
</template>
