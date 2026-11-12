<script setup lang="ts">
import { getWhiteboardElementTitle } from "@/services/whiteboard/getWhiteboardElementTitle";
import { PositionedElementType } from "vue-block-editor-headless";

// The panel the one element selected opens, for every kind but an arrow, which has a panel of its own. A shape and a sticky note take a fill and a
// Sketch level, a shape also its corners, and a shape, a sticky note and a text box take their text controls. Every element but an image takes the
// Colour, width and dash pattern it holds, and every element takes the stacking and the footer
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
    <ResourceWhiteboardEditorPropertiesText
      v-if="
        selected.element.type === PositionedElementType.Shape ||
        selected.element.type === PositionedElementType.StickyNote ||
        selected.element.type === PositionedElementType.Text
      "
      :element="selected.element"
      :index="selected.index"
    />
    <!-- Keyed by the element, so a draft typed into one image's field is never committed to the image that replaces it in the panel -->
    <ResourceWhiteboardEditorPropertiesAltText
      v-if="selected.element.type === PositionedElementType.Image"
      :key="selected.element.id"
      :element="selected.element"
      :index="selected.index"
    />
    <ResourceWhiteboardEditorPropertiesOrder />
    <ResourceWhiteboardEditorPropertiesFooter />
  </EditorContextualPanel>
</template>
