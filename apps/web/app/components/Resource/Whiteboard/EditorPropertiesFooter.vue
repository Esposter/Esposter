<script setup lang="ts">
import { UiButtonVariant } from "#src/models/ui/UiButtonVariant";
import { UiIconMeaning } from "#src/models/ui/UiIconMeaning";
import { copySelection, requestSelectionDelete } from "#src/services/whiteboard/keyboard/selectionActions";
import { useWhiteboardDialogStore } from "#src/store/resource/whiteboard/dialog";
import { useWhiteboardEditorStore } from "#src/store/resource/whiteboard/editor";
import { useWhiteboardStore } from "#src/store/resource/whiteboard/index";

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
