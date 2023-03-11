<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";
import { useItemStore } from "@/store/tableEditor/item";

const tableEditorStore = useTableEditorStore();
const { searchQuery } = storeToRefs(tableEditorStore);
const itemStore = useItemStore();
const { editedItem } = storeToRefs(itemStore);
const EditForm = computed(() =>
  defineAsyncComponent(() =>
    editedItem.value
      ? import(`@/components/TableEditor/${editedItem.value.type}/EditForm.vue`)
      : new Promise(() => null)
  )
);
</script>

<template>
  <v-toolbar pr="4" color="surface">
    <v-toolbar-title>Table Editor</v-toolbar-title>
    <v-text-field v-model="searchQuery" append-inner-icon="mdi-magnify" label="Search" hide-details />
    <v-divider mx="4!" thickness="2" inset vertical />
    <TableEditorCreateItemButton />
    <TableEditorEditFormDialog>
      <component :is="EditForm" />
    </TableEditorEditFormDialog>
  </v-toolbar>
</template>
