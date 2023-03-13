<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore();
const { editFormRef, isFullScreenDialog } = storeToRefs(tableEditorStore);
</script>

<template>
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
</template>
