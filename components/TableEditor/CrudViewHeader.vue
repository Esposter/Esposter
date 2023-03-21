<script setup lang="ts">
import { EditFormMap } from "@/services/tableEditor/constants";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore()();
const { searchQuery, editedItem } = storeToRefs(tableEditorStore);
</script>

<template>
  <v-toolbar pr="4" color="surface">
    <v-toolbar-title>Table Editor</v-toolbar-title>
    <v-text-field v-model="searchQuery" append-inner-icon="mdi-magnify" label="Search" hide-details />
    <v-divider mx="4!" thickness="2" inset vertical />
    <TableEditorCreateItemButton />
    <TableEditorEditFormDialog>
      <component :is="EditFormMap[editedItem.type]" v-if="editedItem" />
    </TableEditorEditFormDialog>
  </v-toolbar>
</template>
