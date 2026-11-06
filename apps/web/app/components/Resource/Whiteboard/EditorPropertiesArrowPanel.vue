<script setup lang="ts">
import { GestureTool } from "@/models/whiteboard/GestureTool";
import { getSelectedElement } from "@/services/whiteboard/getSelectedElement";
import { WhiteboardToolItemMap } from "@/services/whiteboard/tool/WhiteboardToolItemMap";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { PositionedElementType } from "headless-block-editor";

// The panel an arrow selected opens: its route and arrowheads, its stacking and the footer. It is the content the layout keys to the arrow
// selection kind
const whiteboardStore = useWhiteboardStore();
const { editState } = storeToRefs(whiteboardStore);
const whiteboardEditorStore = useWhiteboardEditorStore();
const { selectedIds } = storeToRefs(whiteboardEditorStore);
const selected = computed(() => getSelectedElement(editState.value.document, selectedIds.value));
</script>

<template>
  <EditorContextualPanel v-if="selected" :selected-count="1" :title="WhiteboardToolItemMap[GestureTool.Arrow].title">
    <ResourceWhiteboardEditorPropertiesArrow
      v-if="selected.element.type === PositionedElementType.Arrow"
      :arrow="selected.element"
      :index="selected.index"
    />
    <ResourceWhiteboardEditorPropertiesOrder :index="selected.index" />
    <ResourceWhiteboardEditorPropertiesFooter />
  </EditorContextualPanel>
</template>
