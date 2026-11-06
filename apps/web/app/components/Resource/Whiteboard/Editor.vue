<script setup lang="ts">
import type { Point } from "headless-block-editor";

import { useWhiteboardGesture } from "@/composables/whiteboard/useWhiteboardGesture";
import { useWhiteboardKeyboard } from "@/composables/whiteboard/useWhiteboardKeyboard";
import { useWhiteboardTextEdit } from "@/composables/whiteboard/useWhiteboardTextEdit";
import { getHitElementId } from "@/services/whiteboard/gesture/getHitElementId";
import { getHitTolerance } from "@/services/whiteboard/gesture/getHitTolerance";
import { getWorldPoint } from "@/services/whiteboard/gesture/getWorldPoint";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardDialogStore } from "@/store/resource/whiteboard/dialog";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { getExportBounds } from "headless-block-editor";

// The whiteboard's editor: the palette beside the canvas, the one element's properties over the canvas's right edge. The canvas's events and
// Its overlay and Html slots are wired here to the gesture, keyboard and text-edit logic, and the delete confirmation is the one dialog it holds
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
  <div flex gap-2 h-full>
    <ResourceWhiteboardEditorPalette shrink-0 />
    <div flex-1 h-full min-w-0 relative>
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
      <ResourceWhiteboardEditorToolbar left-2 top-2 absolute />
      <ResourceWhiteboardEditorControls bottom-2 left-2 absolute />
      <!-- Over the canvas's right edge, so a selection never resizes the canvas, and under the toolbar's row so a narrow canvas never puts the two on each other -->
      <ResourceWhiteboardEditorPropertiesPanel right-2 top-12 absolute max-h="[calc(100%_-_3.5rem)]" of-y-auto />
    </div>
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
