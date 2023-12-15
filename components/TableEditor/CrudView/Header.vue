<script setup lang="ts">
import { type TodoListItem } from "@/models/tableEditor/todoList/TodoListItem";
import { useTableEditorStore } from "@/store/tableEditor";

defineSlots<{
  "append-header": (props: {}) => unknown;
}>();

const tableEditorStore = useTableEditorStore<TodoListItem>()();
const { editedItem } = storeToRefs(tableEditorStore);
const component = computed(() => (editedItem.value ? useEditFormComponent(editedItem.value.type) : null));
</script>

<template>
  <v-toolbar pt-4 pr-4 color="surface">
    <v-toolbar-title>
      <TableEditorTypeSelect />
      <div pt-4 flex items-center>
        <TableEditorSearchBar />
        <v-divider mx-4="!" thickness="2" inset vertical />
        <TableEditorCreateItemButton />
        <slot name="append-header" />
      </div>
    </v-toolbar-title>
    <TableEditorEditFormDialog>
      <component :is="component" v-if="editedItem" />
    </TableEditorEditFormDialog>
  </v-toolbar>
</template>

<style scoped lang="scss">
:deep(.v-toolbar__content) {
  height: auto !important;
}
</style>
