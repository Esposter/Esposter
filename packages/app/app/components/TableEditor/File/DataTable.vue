<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

const { dataSource } = defineProps<{ dataSource: DataSource }>();
const headers = computed(() => [
  ...dataSource.columns.map((column) => ({ key: column.fieldName, title: column.sourceFieldName })),
  { key: "actions", sortable: false, title: "Actions" },
]);
</script>

<template>
  <StyledDataTable
    flex
    flex-1
    flex-col
    :data-table-props="{
      height: '100%',
      headers,
      items: dataSource.rows,
    }"
  >
    <template #top>
      <TableEditorFileHeader />
    </template>
    <template #[`item.actions`]="{ item, index }">
      <TableEditorFileRowActionSlot :columns="dataSource.columns" :index :row="item" />
    </template>
  </StyledDataTable>
</template>
