<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { WHITEBOARD_ZOOM_FACTOR } from "@/services/whiteboard/viewport/constants";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { getExportBounds } from "vue-block-editor-headless";

// Undo and redo, then zoom in and out about the middle of the canvas, and fit the whole document into it. Undo and redo are disabled while
// their history has no edit to step to
const whiteboardStore = useWhiteboardStore();
const { editState } = storeToRefs(whiteboardStore);
const { redo, undo } = whiteboardStore;
const whiteboardEditorStore = useWhiteboardEditorStore();
const { fitTo, zoomBy } = whiteboardEditorStore;
const isUndoAvailable = computed(() => editState.value.history.past.length > 0);
const isRedoAvailable = computed(() => editState.value.history.future.length > 0);
</script>

<template>
  <div p-1 flex gap-1 ui-lifted>
    <UiIconButton
      label="Undo"
      :meaning="UiIconMeaning.Undo"
      :variant="UiButtonVariant.Quiet"
      :disabled="!isUndoAvailable"
      @click="undo()"
    />
    <UiIconButton
      label="Redo"
      :meaning="UiIconMeaning.Redo"
      :variant="UiButtonVariant.Quiet"
      :disabled="!isRedoAvailable"
      @click="redo()"
    />
    <UiIconButton
      label="Zoom out"
      :meaning="UiIconMeaning.ZoomOut"
      :variant="UiButtonVariant.Quiet"
      @click="zoomBy(1 / WHITEBOARD_ZOOM_FACTOR)"
    />
    <UiIconButton
      label="Zoom in"
      :meaning="UiIconMeaning.ZoomIn"
      :variant="UiButtonVariant.Quiet"
      @click="zoomBy(WHITEBOARD_ZOOM_FACTOR)"
    />
    <UiIconButton
      label="Fit to content"
      :meaning="UiIconMeaning.FitToContent"
      :variant="UiButtonVariant.Quiet"
      @click="fitTo(getExportBounds(editState.document))"
    />
  </div>
</template>
