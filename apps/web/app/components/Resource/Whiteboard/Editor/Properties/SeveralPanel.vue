<script setup lang="ts">
import { getMixedValue } from "#src/services/editor/getMixedValue";
import { getSelectedElements } from "#src/services/whiteboard/getSelectedElements";
import { useWhiteboardEditorStore } from "#src/store/resource/whiteboard/editor";
import { useWhiteboardStore } from "#src/store/resource/whiteboard/index";
import { PositionedElementType, updatePositionedElementProperty } from "vue-block-editor-headless";

// The panel a selection of several opens: the fill the shapes and sticky notes in it share, or Mixed where they differ, the align, distribute and
// Stacking controls, and the footer. A change to the fill is one edit that writes it to each of them, and No fill is one edit that clears the fill of each shape in it, since a sticky note keeps its fill
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
const hasShapeFill = computed(() =>
  selectedElements.value.some(({ element }) => element.type === PositionedElementType.Shape && element.fill),
);
</script>

<template>
  <EditorContextualPanel :title>
    <div v-if="fill" flex gap-2 items-center>
      <UiColorField
        :model-value="fill.isMixed ? '' : fill.value"
        label="Fill"
        @update:model-value="
          (value) => {
            commitOperations(
              selectedElements.flatMap(({ element, index }) =>
                'fill' in element
                  ? updatePositionedElementProperty(whiteboard, index, { property: 'fill', value })
                  : [],
              ),
            );
          }
        "
      />
      <span v-if="fill.isMixed" ui-body>Mixed</span>
      <UiButton
        v-if="hasShapeFill"
        @click="
          () => {
            commitOperations(
              selectedElements.flatMap(({ element, index }) =>
                element.type === PositionedElementType.Shape
                  ? updatePositionedElementProperty(whiteboard, index, { property: 'fill', value: '' })
                  : [],
              ),
            );
          }
        "
      >
        No fill
      </UiButton>
    </div>
    <ResourceWhiteboardEditorPropertiesArrange />
    <ResourceWhiteboardEditorPropertiesOrder />
    <ResourceWhiteboardEditorPropertiesFooter />
  </EditorContextualPanel>
</template>
