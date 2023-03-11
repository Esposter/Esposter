<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore();
const { resetItem } = tableEditorStore;
const { editFormRef, editFormDialog, isFullScreenDialog } = storeToRefs(tableEditorStore);

watch(editFormDialog, (newValue) => {
  if (!newValue) resetItem();
});
</script>

<template>
  <v-dialog
    v-model="editFormDialog"
    :fullscreen="isFullScreenDialog"
    :width="isFullScreenDialog ? '100%' : 800"
    persistent
  >
    <StyledCard>
      <v-toolbar color="surface">
        <v-spacer />
        <TableEditorEditFormErrorIcon />
        <TableEditorSaveButton />
        <TableEditorConfirmDeleteDialogButton />
        <v-divider mx="2!" thickness="2" inset vertical />
        <TableEditorToggleFullScreenDialogButton />
        <TableEditorConfirmCloseDialogButton />
      </v-toolbar>
      <v-divider thickness="2" />
      <v-form ref="editFormRef">
        <slot />
      </v-form>
    </StyledCard>
  </v-dialog>
</template>
