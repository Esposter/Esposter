<script setup lang="ts">
import type { Item } from "@/models/tableEditor/Item";
import { ItemCategoryDefinition } from "@/models/tableEditor/ItemCategoryDefinition";
import { getItemCategoryDefinition } from "@/services/tableEditor/itemCategoryDefinition";
import { propsMap } from "@/services/tableEditor/propsMap";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore()();
const { editItem } = tableEditorStore;
const { tableEditor, tableEditorType, searchQuery } = storeToRefs(tableEditorStore);
const props = computed(() => propsMap[tableEditorType.value]);
// We can assume that the first element of the headers is the type
const itemTypeKey = computed(() => props.value.headers[0].key);

const getItemCategoryDefinitionByItem = (item: unknown) =>
  getItemCategoryDefinition(
    props.value.itemCategoryDefinitions as unknown as ItemCategoryDefinition[],
    (item as { raw: Item }).raw,
  );
</script>

<template>
  <v-container h="full" display="flex" flex="col" fluid>
    <StyledDataTable
      display="flex"
      flex="1 col"
      height="100%"
      :headers="props.headers"
      :items="tableEditor?.items"
      :search="searchQuery"
      :sort-by="[{ key: 'name', order: 'asc' }]"
      @click:row="(_, { item }) => editItem(item.raw.id)"
    >
      <template #top>
        <TableEditorCrudViewHeader />
      </template>
      <template #[`item.${itemTypeKey}`]="{ item }">
        <v-chip label>
          <v-icon :icon="getItemCategoryDefinitionByItem(item).icon" />
          &nbsp;
          {{ getItemCategoryDefinitionByItem(item).title }}
        </v-chip>
      </template>
    </StyledDataTable>
  </v-container>
</template>
