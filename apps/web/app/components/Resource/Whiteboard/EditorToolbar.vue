<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { WHITEBOARD_TOOL_ITEMS } from "@/services/whiteboard/tool/constants";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";

// The tool a press is read by: the select tool, the hand that pans, or freehand drawing. Beside it, the switch that snaps a move or a resize to the grid
const whiteboardEditorStore = useWhiteboardEditorStore();
const { isSnapEnabled, tool } = storeToRefs(whiteboardEditorStore);
const { toggleSnap } = whiteboardEditorStore;
</script>

<template>
  <div p-1 flex gap-1 ui-lifted>
    <UiToggleGroup v-model="tool" is-icon-only label="Tool" :items="WHITEBOARD_TOOL_ITEMS" />
    <UiIconButton
      label="Snap to grid"
      :meaning="UiIconMeaning.Snap"
      :variant="isSnapEnabled ? UiButtonVariant.Accent : undefined"
      @click="toggleSnap()"
    />
  </div>
</template>
