<script setup lang="ts">
import { getMixedValue } from "@/services/editor/getMixedValue";
import { getSelectedElements } from "@/services/whiteboard/getSelectedElements";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { PositionedElementType, updatePositionedElementProperty } from "headless-block-editor";

// The panel a selection of several opens: the fill the shapes and sticky notes in it share, or Mixed where they differ, and the footer. A
// change to the fill is one edit that writes it to each of them
const whiteboardStore = useWhiteboardStore();
const { commitOperations } = whiteboardStore;
const { editState, whiteboard } = storeToRefs(whiteboardStore);
const whiteboardEditorStore = useWhiteboardEditorStore();
const { selectedIds } = storeToRefs(whiteboardEditorStore);
const selectedElements = computed(() => getSelectedElements(editState.value.document, selectedIds.value));
const title = computed(() => {
  const isAllShapes = selectedElements.value.every(({ element }) => element.type === PositionedElementType.Shape);
  return `${selectedElements.value.length} ${isAllShapes ? "shapes" : "elements"}`;
});
const fill = computed(() =>
  getMixedValue(selectedElements.value.flatMap(({ element }) => ("fill" in element ? [element.fill] : []))),
);
const changeFill = (value: string) => {
  commitOperations(
    selectedElements.value.flatMap(({ element, index }) =>
      "fill" in element ? updatePositionedElementProperty(whiteboard.value, index, { property: "fill", value }) : [],
    ),
  );
};
</script>

<template>
  <EditorContextualPanel :selected-count="selectedIds.length" :title>
    <div v-if="fill" flex gap-2 items-center>
      <UiColorField
        :model-value="fill.isMixed ? '' : fill.value"
        label="Fill"
        @update:model-value="(value) => changeFill(value)"
      />
      <span v-if="fill.isMixed" ui-body>Mixed</span>
    </div>
    <ResourceWhiteboardEditorPropertiesFooter />
  </EditorContextualPanel>
</template>
