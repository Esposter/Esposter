<script setup lang="ts">
import { DefaultPropsMap } from "@/services/tableEditor/DefaultPropsMap";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore();
const { editItem } = tableEditorStore;
const { searchQuery, tableEditor, tableEditorType } = storeToRefs(tableEditorStore);
const props = computed(() => DefaultPropsMap[tableEditorType.value]);
// We can assume that the first element of the headers is the type
const firstColumnKey = computed(() => props.value.headers[0].key);
const richTextColumnKeys = computed(() =>
  props.value.headers.filter(({ isRichText }) => isRichText).map(({ key }) => key as string),
);
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
      @click:row="(_event, { item }) => editItem({ id: item.id })"
    >
      <template #top>
        <TableEditorCrudViewTopSlot />
      </template>
      <template #[`item.${firstColumnKey}`]="{ item }">
        <TableEditorCrudViewFirstColumnSlot :item />
      </template>
      <template
        v-for="richTextColumnKey of richTextColumnKeys"
        :key="richTextColumnKey"
        #[`item.${richTextColumnKey}`]="{ item }"
      >
        <div v-html="item[richTextColumnKey]" />
      </template>
    </StyledDataTable>
  </v-container>
</template>
