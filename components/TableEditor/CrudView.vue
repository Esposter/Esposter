<script setup lang="ts">
import type { Item } from "@/models/tableEditor/Item";
import { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import { getItemCategoryDefinition } from "@/services/tableEditor/itemCategoryDefinition";
import { propsMap } from "@/services/tableEditor/propsMap";
import { useTableEditorStore } from "@/store/tableEditor";
import { VDataTable } from "vuetify/labs/VDataTable";

const tableEditorStore = useTableEditorStore()();
const { editItem } = tableEditorStore;
const { tableEditor, tableEditorType, searchQuery } = storeToRefs(tableEditorStore);
const props = computed(() => propsMap[tableEditorType.value]);

const getItemCategoryDefinitionByItem = (item: unknown) =>
  getItemCategoryDefinition(
    props.value.itemCategoryDefinitions as unknown as ItemCategoryDefinition[],
    (item as { raw: Item }).raw
  );
</script>

<template>
  <v-container h="full" display="flex" flex="col" fluid>
    <v-data-table
      display="flex"
      flex="1 col"
      :headers="props.headers"
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
