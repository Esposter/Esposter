<script setup lang="ts">
import { useTableEditorStore } from "@/store/tableEditor";
import { DefaultPropsMap } from "~/services/tableEditor/DefaultPropsMap";

const tableEditorStore = useTableEditorStore()();
const { editItem } = tableEditorStore;
const { tableEditor, tableEditorType, searchQuery } = storeToRefs(tableEditorStore);
const props = computed(() => DefaultPropsMap[tableEditorType.value]);
// We can assume that the first element of the headers is the type
const itemTypeKey = computed(() => props.value.headers[0].key);
</script>

<template>
  <v-container h-full flex flex-col fluid>
    <StyledDataTable
      flex
      flex-1
      flex-col
      :data-table-props="{
        height: '100%',
        headers: props.headers,
        items: tableEditor.items,
        search: searchQuery,
        sortBy: [{ key: 'name', order: 'asc' }],
      }"
      @click:row="(_, { item }) => editItem(item.id)"
    >
      <template #top>
        <TableEditorCrudViewTopSlot />
      </template>
      <template #[`item.${itemTypeKey}`]="{ item }">
        <TableEditorCrudViewItemSlot :item="item" />
      </template>
    </StyledDataTable>
  </v-container>
</template>
~/services/tableEditor/DefaultPropsMap
