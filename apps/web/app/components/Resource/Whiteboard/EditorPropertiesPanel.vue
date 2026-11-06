<script setup lang="ts">
import { getSelectedElement } from "@/services/whiteboard/getSelectedElement";
import { getWhiteboardElementTitle } from "@/services/whiteboard/getWhiteboardElementTitle";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { PositionedElementType } from "headless-block-editor";

// The panel the one element selected opens, for every kind but an arrow, which has a panel of its own. A shape and a sticky note take a fill,
// and every element takes the stacking and the footer
const whiteboardStore = useWhiteboardStore();
const { editState } = storeToRefs(whiteboardStore);
const whiteboardEditorStore = useWhiteboardEditorStore();
const { selectedIds } = storeToRefs(whiteboardEditorStore);
const selected = computed(() => getSelectedElement(editState.value.document, selectedIds.value));
</script>

<template>
  <EditorContextualPanel v-if="selected" :selected-count="1" :title="getWhiteboardElementTitle(selected.element)">
    <ResourceWhiteboardEditorPropertiesFill
      v-if="
        selected.element.type === PositionedElementType.Shape ||
        selected.element.type === PositionedElementType.StickyNote
      "
      :fill="selected.element.fill"
      :index="selected.index"
    />
    <ResourceWhiteboardEditorPropertiesOrder :index="selected.index" />
    <ResourceWhiteboardEditorPropertiesFooter />
  </EditorContextualPanel>
</template>
