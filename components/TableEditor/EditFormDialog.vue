<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore()();
const { resetItem } = tableEditorStore;
const { editFormDialog, isFullScreenDialog } = storeToRefs(tableEditorStore);

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
    <TableEditorEditFormDialogContent>
      <slot />
    </TableEditorEditFormDialogContent>
  </v-dialog>
</template>
