<script setup lang="ts">
import type { Point } from "vue-block-editor-headless";
import type { Context } from "vue-editor-layout-headless";

import { useWhiteboardArrangeKeyboard } from "#src/composables/whiteboard/useWhiteboardArrangeKeyboard";
import { useWhiteboardContextMenu } from "#src/composables/whiteboard/useWhiteboardContextMenu";
import { useWhiteboardGesture } from "#src/composables/whiteboard/useWhiteboardGesture";
import { useWhiteboardKeyboard } from "#src/composables/whiteboard/useWhiteboardKeyboard";
import { useWhiteboardTextEdit } from "#src/composables/whiteboard/useWhiteboardTextEdit";
import { useWhiteboardViewportKeyboard } from "#src/composables/whiteboard/useWhiteboardViewportKeyboard";
import { EditorType } from "#src/models/editor/EditorType";
import { getHitElementId } from "#src/services/whiteboard/gesture/getHitElementId";
import { getHitTolerance } from "#src/services/whiteboard/gesture/getHitTolerance";
import { getWorldPoint } from "#src/services/whiteboard/gesture/getWorldPoint";
import { WHITEBOARD_LAYOUT, WHITEBOARD_REGION_NAME_MAP } from "#src/services/whiteboard/layout/constants";
import { getWhiteboardSelectionKind } from "#src/services/whiteboard/layout/getWhiteboardSelectionKind";
import { WhiteboardContentComponentMap } from "#src/services/whiteboard/layout/WhiteboardContentComponentMap";
import { useWhiteboardDialogStore } from "#src/store/resource/whiteboard/dialog";
import { useWhiteboardEditorStore } from "#src/store/resource/whiteboard/editor";
import { useWhiteboardStore } from "#src/store/resource/whiteboard/index";

// The whiteboard's editor, drawn by the editor shell over the whiteboard's layout and registry. The canvas is the shell's default slot.
// Its events and its overlay and Html slots are wired here to the gesture, keyboard and text-edit logic. The delete confirmation is the one dialog it holds
const whiteboardStore = useWhiteboardStore();
const { loadContent, saveWhiteboard } = whiteboardStore;
const { editState, whiteboard } = storeToRefs(whiteboardStore);
await loadContent();
watchAutosave(whiteboard, saveWhiteboard);
const whiteboardEditorStore = useWhiteboardEditorStore();
const { canvasRect, selectedIds, tool, viewport } = storeToRefs(whiteboardEditorStore);
const { fitToElements, setTextEditElementId } = whiteboardEditorStore;
const { onPointer, onWheel } = useWhiteboardGesture();
useWhiteboardViewportKeyboard();
const whiteboardDialogStore = useWhiteboardDialogStore();
const { deletingIds } = storeToRefs(whiteboardDialogStore);
const {
  confirmDelete,
  copySelectionToClipboard,
  cutSelection,
  deleteSelection,
  duplicateSelection,
  isDeleteOpen,
  pasteClipboardText,
  selectAll,
} = useWhiteboardKeyboard(editState, selectedIds, deletingIds, tool);
useWhiteboardArrangeKeyboard(editState, selectedIds, isDeleteOpen);
useWhiteboardStyleKeyboard(editState, selectedIds, isDeleteOpen);
const {
  draft,
  onBlur,
  onCompositionEnd,
  onCompositionStart,
  onKeydown: onTextEditKeydown,
  startTextEdit,
  textEdit,
} = useWhiteboardTextEdit(editState);
const { getContextMenuGestureProps } = useContextMenu();
const { onOpenContextMenu } = useWhiteboardContextMenu(editState, {
  copy: copySelectionToClipboard,
  cut: cutSelection,
  deleteSelection,
  duplicate: duplicateSelection,
  editText: startTextEdit,
  pasteText: pasteClipboardText,
  selectAll,
});
// A key the text box takes stays in it: Escape discards the edit, and the window's shortcuts would otherwise clear the selection on that same key
const onTextKeydown = (event: KeyboardEvent) => {
  onTextEditKeydown(event);
  if (event.defaultPrevented) event.stopPropagation();
};
// The canvas draws no text of the element being edited, since the editor over it is that text. The store outlives the
// Editor, so an edit still open when it unmounts clears the id here, or the element's text stays hidden on the next open
watch(
  () => textEdit.value?.elementId,
  (newElementId) => {
    setTextEditElementId(newElementId || "");
  },
);
onUnmounted(() => {
  setTextEditElementId("");
});
const textEditElement = computed(() =>
  editState.value.document.elements.find(({ id }) => id === textEdit.value?.elementId),
);
// What the reader is doing, which the shell reads to show each panel the layout puts under the selection
const context = computed<Context>(() => ({
  mode: "",
  selectionCount: selectedIds.value.length,
  selectionKind: getWhiteboardSelectionKind(editState.value.document, selectedIds.value),
  tool: tool.value,
}));
// The id of the element a screen point lands on, which a double click edits the text of
const getElementIdAt = (screen: Point) =>
  getHitElementId(
    editState.value.document,
    getWorldPoint(screen, viewport.value),
    getHitTolerance(viewport.value.scale),
  );
// A document opened with content is fitted to the canvas once, when the canvas is first measured
if (editState.value.document.elements.length > 0)
  watchOnce(canvasRect, () => {
    fitToElements(editState.value.document.elements);
  });
</script>

<template>
  <div h-full>
    <!-- Each region holds one panel, which takes the region's id, so the region's name is the panel's name too -->
    <EditorShell
      :context
      :editor-type="EditorType.Whiteboard"
      :layout="WHITEBOARD_LAYOUT"
      :panel-name-map="WHITEBOARD_REGION_NAME_MAP"
      :region-name-map="WHITEBOARD_REGION_NAME_MAP"
      :registry="WhiteboardContentComponentMap"
    >
      <ResourceWhiteboardEditorCanvas
        :="getContextMenuGestureProps(onOpenContextMenu)"
        @double-click="
          (screen) => {
            const elementId = getElementIdAt(screen);
            if (elementId !== undefined) startTextEdit(elementId);
          }
        "
        @paste="(text) => pasteClipboardText(text)"
        @pointer="(event) => onPointer(event)"
        @wheel="(event) => onWheel(event)"
      >
        <template #overlay>
          <ResourceWhiteboardEditorSelection />
          <ResourceWhiteboardEditorMarquee />
          <ResourceWhiteboardEditorSnapGuides />
        </template>
        <template #html>
          <ResourceWhiteboardEditorTextEdit
            v-if="textEditElement"
            v-model="draft"
            :element="textEditElement"
            @blur="onBlur()"
            @composition-end="onCompositionEnd()"
            @composition-start="onCompositionStart()"
            @keydown="(event) => onTextKeydown(event)"
          />
        </template>
      </ResourceWhiteboardEditorCanvas>
    </EditorShell>
    <UiConfirmDialog v-model="isDeleteOpen" confirm-label="Delete" title="Delete" :confirm="confirmDelete">
      <p>Arrows bound only to what is deleted are deleted with it.</p>
    </UiConfirmDialog>
  </div>
</template>
