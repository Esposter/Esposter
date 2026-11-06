<script setup lang="ts">
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { copySelection, requestSelectionDelete } from "@/services/whiteboard/keyboard/selectionActions";
import { useWhiteboardStore } from "@/store/resource/whiteboard";
import { useWhiteboardDialogStore } from "@/store/resource/whiteboard/dialog";
import { useWhiteboardEditorStore } from "@/store/resource/whiteboard/editor";

// Duplicate and delete the selection from the panel, as the keys do. Delete names the selection for the editor's confirmation, which asks first
const whiteboardStore = useWhiteboardStore();
const { editState } = storeToRefs(whiteboardStore);
const whiteboardEditorStore = useWhiteboardEditorStore();
const { selectedIds } = storeToRefs(whiteboardEditorStore);
const whiteboardDialogStore = useWhiteboardDialogStore();
const { deletingIds } = storeToRefs(whiteboardDialogStore);
const duplicateSelection = () => {
  copySelection(editState, selectedIds);
};
const requestDeleteSelection = () => {
  requestSelectionDelete(deletingIds, selectedIds);
};
</script>

<template>
  <div flex gap-1>
    <UiIconButton
      label="Duplicate"
      :meaning="UiIconMeaning.Copy"
      :variant="UiButtonVariant.Quiet"
      @click="duplicateSelection()"
    />
    <UiIconButton
      label="Delete"
      :meaning="UiIconMeaning.Delete"
      :variant="UiButtonVariant.Quiet"
      @click="requestDeleteSelection()"
    />
  </div>
</template>
