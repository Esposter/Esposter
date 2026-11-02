<script setup lang="ts">
import { getSelectedElement } from "@/services/whiteboard/getSelectedElement";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { PositionedElementType } from "headless-block-editor";

// The properties of the one element selected. Nothing shows for a selection of several, or of none
const whiteboardStore = useWhiteboardStore();
const { editState } = storeToRefs(whiteboardStore);
const whiteboardEditorStore = useWhiteboardEditorStore();
const { selectedIds } = storeToRefs(whiteboardEditorStore);
const selected = computed(() => getSelectedElement(editState.value.document, selectedIds.value));
</script>

<template>
  <div v-if="selected" p-2 flex flex-col gap-3 ui-lifted>
    <ResourceWhiteboardEditorPropertiesFill
      v-if="
        selected.element.type === PositionedElementType.Shape ||
        selected.element.type === PositionedElementType.StickyNote
      "
      :fill="selected.element.fill"
      :index="selected.index"
    />
    <ResourceWhiteboardEditorPropertiesArrow
      v-if="selected.element.type === PositionedElementType.Arrow"
      :arrow="selected.element"
      :index="selected.index"
    />
    <ResourceWhiteboardEditorPropertiesOrder :index="selected.index" />
  </div>
</template>
