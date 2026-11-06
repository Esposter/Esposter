<script setup lang="ts">
import type { Context } from "vue-editor-layout-headless";
import type { Point } from "headless-block-editor";

import { useWhiteboardGesture } from "@/composables/whiteboard/useWhiteboardGesture";
import { useWhiteboardKeyboard } from "@/composables/whiteboard/useWhiteboardKeyboard";
import { useWhiteboardTextEdit } from "@/composables/whiteboard/useWhiteboardTextEdit";
import { EditorType } from "@/models/editor/EditorType";
import { getHitElementId } from "@/services/whiteboard/gesture/getHitElementId";
import { getHitTolerance } from "@/services/whiteboard/gesture/getHitTolerance";
import { getWorldPoint } from "@/services/whiteboard/gesture/getWorldPoint";
import { getWhiteboardSelectionKind } from "@/services/whiteboard/layout/getWhiteboardSelectionKind";
import { WHITEBOARD_LAYOUT, WHITEBOARD_REGION_NAME_MAP } from "@/services/whiteboard/layout/constants";
import { WhiteboardContentComponentMap } from "@/services/whiteboard/layout/WhiteboardContentComponentMap";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardDialogStore } from "@/store/resource/whiteboard/dialog";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { getExportBounds } from "headless-block-editor";

// The whiteboard's editor, drawn by the editor shell over the whiteboard's layout and registry. The canvas is the shell's default slot, and its
// Events and its overlay and Html slots are wired here to the gesture, keyboard and text-edit logic. The delete confirmation is the one dialog it holds
const whiteboardStore = useWhiteboardStore();
const { loadContent, saveWhiteboard } = whiteboardStore;
const { editState, whiteboard } = storeToRefs(whiteboardStore);
await loadContent();
watchAutosave(whiteboard, saveWhiteboard);
const whiteboardEditorStore = useWhiteboardEditorStore();
const { canvasRect, selectedIds, shapeKind, tool, viewport } = storeToRefs(whiteboardEditorStore);
const { fitTo } = whiteboardEditorStore;
const { onPointer } = useWhiteboardGesture();
const whiteboardDialogStore = useWhiteboardDialogStore();
const { deletingIds } = storeToRefs(whiteboardDialogStore);
const { confirmDelete, isDeleteOpen } = useWhiteboardKeyboard(editState, selectedIds, deletingIds, tool, shapeKind);
const {
  draft,
  onBlur,
  onCompositionEnd,
  onCompositionStart,
  onKeydown: onTextEditKeydown,
  startTextEdit,
  textEdit,
} = useWhiteboardTextEdit(editState);
// A key the text box takes stays in it: Escape discards the edit, and the window's shortcuts would otherwise clear the selection on that same key
const onTextKeydown = (event: KeyboardEvent) => {
  onTextEditKeydown(event);
  if (event.defaultPrevented) event.stopPropagation();
};
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
    fitTo(getExportBounds(editState.value.document));
  });
</script>

<template>
  <div h-full>
    <EditorShell
      :context
      :editor-type="EditorType.Whiteboard"
      :layout="WHITEBOARD_LAYOUT"
      :region-name-map="WHITEBOARD_REGION_NAME_MAP"
      :registry="WhiteboardContentComponentMap"
    >
      <ResourceWhiteboardEditorCanvas
        @double-click="
          (screen) => {
            const elementId = getElementIdAt(screen);
            if (elementId !== undefined) startTextEdit(elementId);
          }
        "
        @pointer="(event) => onPointer(event)"
      >
        <template #overlay>
          <ResourceWhiteboardEditorSelection />
          <ResourceWhiteboardEditorMarquee />
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
    <UiConfirmDialog
      v-model="isDeleteOpen"
      confirm-label="Delete"
      is-optimistic
      title="Delete"
      :confirm="confirmDelete"
    >
      <p>Arrows bound only to what is deleted are deleted with it.</p>
    </UiConfirmDialog>
  </div>
</template>
