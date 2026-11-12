<script setup lang="ts">
import type { ShapeElement, StickyNoteElement } from "vue-block-editor-headless";

import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { PositionedElementType } from "vue-block-editor-headless";

interface Props {
  element: ShapeElement | StickyNoteElement;
  index: number;
}

// The fill of a shape or a sticky note, changed as the picker is moved. A shape can also clear its fill back to none, which a sticky note keeps
defineProps<Props>();
const whiteboardStore = useWhiteboardStore();
const { updateElementProperty } = whiteboardStore;
</script>

<template>
  <div flex flex-col gap-2>
    <UiColorField
      :model-value="element.fill"
      label="Fill"
      @update:model-value="(value) => updateElementProperty(index, { property: 'fill', value })"
    />
    <UiButton
      v-if="element.type === PositionedElementType.Shape"
      @click="updateElementProperty(index, { property: 'fill', value: '' })"
    >
      No fill
    </UiButton>
  </div>
</template>
