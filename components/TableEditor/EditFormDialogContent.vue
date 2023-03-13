<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore();
const { editFormRef, isFullScreenDialog } = storeToRefs(tableEditorStore);
const maxHeight = computed(() => (isFullScreenDialog.value ? "initial" : "60vh"));
</script>

<template>
  <StyledCard overflow="hidden!">
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
    <v-form ref="editFormRef" display="flex" flex="1 col">
      <slot />
    </v-form>
  </StyledCard>
</template>

<style scoped lang="scss">
:deep(.v-window-item > .v-container) {
  max-height: v-bind(maxHeight);
  overflow-y: auto;
}
</style>
