<script setup lang="ts">
import { getWhiteboardElementTitle } from "@/services/whiteboard/getWhiteboardElementTitle";
import { PositionedElementType } from "vue-block-editor-headless";

// The panel the one element selected opens, for every kind but an arrow, which has a panel of its own. A shape and a sticky note take a fill and a
// Sketch level, a shape also its corners, and every element but an image takes the colour, width and dash pattern it holds. Every element takes the
// Stacking and the footer
const selected = useWhiteboardSelectedElement();
</script>

<template>
  <EditorContextualPanel v-if="selected" :title="getWhiteboardElementTitle(selected.element)">
    <ResourceWhiteboardEditorPropertiesFill
      v-if="
        selected.element.type === PositionedElementType.Shape ||
        selected.element.type === PositionedElementType.StickyNote
      "
      :element="selected.element"
      :index="selected.index"
    />
    <ResourceWhiteboardEditorPropertiesStroke
      v-if="selected.element.type !== PositionedElementType.Image"
      :element="selected.element"
      :index="selected.index"
    />
    <ResourceWhiteboardEditorPropertiesSketch
      v-if="
        selected.element.type === PositionedElementType.Shape ||
        selected.element.type === PositionedElementType.StickyNote
      "
      :element="selected.element"
      :index="selected.index"
    />
    <ResourceWhiteboardEditorPropertiesOrder :index="selected.index" />
    <ResourceWhiteboardEditorPropertiesFooter />
  </EditorContextualPanel>
</template>
