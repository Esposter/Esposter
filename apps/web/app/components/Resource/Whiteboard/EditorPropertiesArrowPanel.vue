<script setup lang="ts">
import { getWhiteboardElementTitle } from "@/services/whiteboard/getWhiteboardElementTitle";
import { PositionedElementType } from "vue-block-editor-headless";

// The panel an arrow selected opens: its route and arrowheads, its colour, width, dash pattern and sketch level, its stacking and the footer. It is the
// Content the layout keys to the arrow's selection kind
const selected = useWhiteboardSelectedElement();
</script>

<template>
  <EditorContextualPanel v-if="selected" :title="getWhiteboardElementTitle(selected.element)">
    <ResourceWhiteboardEditorPropertiesArrow
      v-if="selected.element.type === PositionedElementType.Arrow"
      :arrow="selected.element"
      :index="selected.index"
    />
    <ResourceWhiteboardEditorPropertiesStroke
      v-if="selected.element.type === PositionedElementType.Arrow"
      :element="selected.element"
      :index="selected.index"
    />
    <ResourceWhiteboardEditorPropertiesSketch
      v-if="selected.element.type === PositionedElementType.Arrow"
      :element="selected.element"
      :index="selected.index"
    />
    <ResourceWhiteboardEditorPropertiesOrder :index="selected.index" />
    <ResourceWhiteboardEditorPropertiesFooter />
  </EditorContextualPanel>
</template>
