<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore();
const { editFormRef, editedItem } = storeToRefs(tableEditorStore);
const displayType = computed(() => (editedItem.value ? prettifyName(editedItem.value.type) : ""));
</script>

<template>
  <StyledCard>
    <v-toolbar flex="none" color="surface" :title="`Configuration - ${displayType}`">
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

<style scoped lang="scss">
:deep(.v-toolbar__content) {
  height: auto !important;
  flex-wrap: wrap;
}

:deep(.v-toolbar-title) {
  flex: none;
}

:deep(.v-toolbar-title__placeholder) {
  overflow: initial;
}
</style>
