<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";
import { prettifyName } from "@/util/text";

const tableEditorStore = useTableEditorStore()();
const { editedItem } = storeToRefs(tableEditorStore);
const displayType = computed(() => (editedItem.value ? prettifyName(editedItem.value.type) : ""));
</script>

<template>
  <v-toolbar flex-none color="surface" :title="`Configuration - ${displayType}`">
    <v-spacer />
    <TableEditorEditFormErrorIcon />
    <TableEditorSaveButton />
    <TableEditorConfirmDeleteDialogButton />
    <v-divider mx="2!" thickness="2" inset vertical />
    <TableEditorToggleFullScreenDialogButton />
    <TableEditorConfirmCloseDialogButton />
  </v-toolbar>
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
