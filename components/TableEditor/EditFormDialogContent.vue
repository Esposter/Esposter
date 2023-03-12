<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore();
const { editFormRef, isFullScreenDialog } = storeToRefs(tableEditorStore);
const maxHeight = computed(() => (isFullScreenDialog.value ? "100%" : "70vh"));
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
// Minus the height of the toolbar + tabs + 2px to perfectly match normal scrollbar
:deep(.v-form) {
  max-height: calc(100% - 64px);

  & > .v-window {
    max-height: calc(100% - 72px);

    & > .v-window__container {
      max-height: v-bind(maxHeight);
      overflow-x: hidden;
      overflow-y: auto;
    }
  }
}
</style>
