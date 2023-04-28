<script setup lang="ts">
import type { Item } from "@/models/tableEditor/Item";
import { ItemType } from "@/models/tableEditor/ItemType";
import {
  getItemCategoryDefinition,
  tableEditorItemCategoryDefinitions,
} from "@/services/tableEditor/itemCategoryDefinition";
import type { DataTableHeader } from "@/services/vuetify/dataTable";
import { useTableEditorStore } from "@/store/tableEditor";
import { VDataTable } from "vuetify/labs/VDataTable";

const tableEditorStore = useTableEditorStore()();
const { editItem } = tableEditorStore;
const { tableEditor, searchQuery } = storeToRefs(tableEditorStore);
const headers = computed<DataTableHeader[]>(() => {
  const result: DataTableHeader[] = [
    { title: "Name", key: "name" },
    { title: "Type", key: "type" },
  ];

  if (tableEditor.value?.items.some((item) => item.type === ItemType.TodoList))
    result.push({ title: "Notes", key: "notes" });

  return result;
});
const getItemCategoryDefinitionByItem = (item: unknown) =>
  getItemCategoryDefinition(tableEditorItemCategoryDefinitions, (item as { raw: Item }).raw);
</script>

<template>
  <v-container h="full" display="flex" flex="col" fluid>
    <v-data-table
      display="flex"
      flex="1 col"
      :headers="headers"
      :items="tableEditor?.items"
      :search="searchQuery"
      :sort-by="[{ key: 'name', order: 'asc' }]"
      height="100%"
      @click:row="(_, { item }) => editItem(item.raw.id)"
    >
      <template #top>
        <TableEditorCrudViewHeader />
      </template>
      <template #[`item.type`]="{ item }">
        <v-chip>
          <v-icon :icon="getItemCategoryDefinitionByItem(item).icon" />
          {{ getItemCategoryDefinitionByItem(item).title }}
        </v-chip>
      </template>
    </v-data-table>
  </v-container>
</template>
