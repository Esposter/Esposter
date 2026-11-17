<script setup lang="ts">
import { getWhiteboardElementTitle } from "#src/services/whiteboard/getWhiteboardElementTitle";
import { PositionedElementType } from "vue-block-editor-headless";

// The panel an arrow selected opens: its route and arrowheads, its colour, width, dash pattern, sketch level and label size, its stacking and the footer. It is the
// Content the layout keys to the arrow's selection kind
const selected = useWhiteboardSelectedElement();
</script>

<template>
  <EditorContextualPanel v-if="selected" :title="getWhiteboardElementTitle(selected.element)">
    <template v-if="selected.element.type === PositionedElementType.Arrow">
      <ResourceWhiteboardEditorPropertiesArrow :arrow="selected.element" :index="selected.index" />
      <ResourceWhiteboardEditorPropertiesStroke :element="selected.element" :index="selected.index" />
      <ResourceWhiteboardEditorPropertiesSketch :element="selected.element" :index="selected.index" />
      <ResourceWhiteboardEditorPropertiesText :element="selected.element" :index="selected.index" />
    </template>
    <ResourceWhiteboardEditorPropertiesOrder />
    <ResourceWhiteboardEditorPropertiesFooter />
  </EditorContextualPanel>
</template>
