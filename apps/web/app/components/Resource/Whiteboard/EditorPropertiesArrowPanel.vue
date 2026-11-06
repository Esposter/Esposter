<script setup lang="ts">
import { getSelectedElement } from "@/services/whiteboard/getSelectedElement";
import { getWhiteboardElementTitle } from "@/services/whiteboard/getWhiteboardElementTitle";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { PositionedElementType } from "vue-block-editor-headless";

// The panel an arrow selected opens: its route and arrowheads, its stacking and the footer. It is the content the layout keys to the arrow
// Selection kind
const whiteboardStore = useWhiteboardStore();
const { editState } = storeToRefs(whiteboardStore);
const whiteboardEditorStore = useWhiteboardEditorStore();
const { selectedIds } = storeToRefs(whiteboardEditorStore);
const selected = computed(() => getSelectedElement(editState.value.document, selectedIds.value));
</script>

<template>
  <EditorContextualPanel v-if="selected" :selected-count="1" :title="getWhiteboardElementTitle(selected.element)">
    <ResourceWhiteboardEditorPropertiesArrow
      v-if="selected.element.type === PositionedElementType.Arrow"
      :arrow="selected.element"
      :index="selected.index"
    />
    <ResourceWhiteboardEditorPropertiesOrder :index="selected.index" />
    <ResourceWhiteboardEditorPropertiesFooter />
  </EditorContextualPanel>
</template>
