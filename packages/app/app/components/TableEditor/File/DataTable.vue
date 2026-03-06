<script setup lang="ts">
import type { CsvColumn } from "#shared/models/tableEditor/file/CsvColumn";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

const { dataSource } = defineProps<{ dataSource: DataSource }>();
const headers = computed(() => [
  ...dataSource.columns.map((column) => ({ key: column.name, title: column.sourceName })),
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
    <template #[`item.actions`]="{ item, index }">
      <TableEditorFileRowActionSlot
        :columns="dataSource.columns as CsvColumn[]"
        :index
        :row="item"
      />
    </template>
  </StyledDataTable>
</template>
