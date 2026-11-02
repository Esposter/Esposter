<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { WHITEBOARD_ZOOM_FACTOR } from "@/services/whiteboard/viewport/constants";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";
import { getExportBounds } from "headless-block-editor";

// Zoom in and out about the middle of the canvas, and fit the whole document into it
const whiteboardStore = useWhiteboardStore();
const { editState } = storeToRefs(whiteboardStore);
const whiteboardEditorStore = useWhiteboardEditorStore();
const { fitTo, zoomBy } = whiteboardEditorStore;
</script>

<template>
  <div p-1 flex gap-1 ui-lifted>
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
