<script setup lang="ts">
import type { Item } from "#shared/models/tableEditor/data/Item";
import type { ItemSlot } from "vuetify/lib/components/VDataTable/types.mjs";

import { DefaultPropsMap } from "@/services/tableEditor/DefaultPropsMap";
import { useTableEditorStore } from "@/store/tableEditor";
import { takeOne } from "@esposter/shared";

const tableEditorStore = useTableEditorStore();
const { editItem } = tableEditorStore;
const { searchQuery, tableEditor, tableEditorType } = storeToRefs(tableEditorStore);
const props = computed(() => DefaultPropsMap[tableEditorType.value]);
// We can assume that the first element of the headers is the type
const firstColumnKey = computed(() => takeOne(props.value.headers).key);
const richTextColumnKeys = computed(() =>
  props.value.headers.filter(({ isRichText }) => isRichText).map(({ key }) => key as string),
);
const onClickRow = (_event: MouseEvent, { item }: ItemSlot<Item>) => editItem({ id: item.id });
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
      @click:row="onClickRow"
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
