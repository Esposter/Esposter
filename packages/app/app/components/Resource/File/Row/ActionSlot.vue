<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";

interface ActionSlotProps {
  columns: DataSource["columns"];
  index: number;
  row: DataSource["rows"][number];
}

const { columns, index, row } = defineProps<ActionSlotProps>();
</script>

<template>
  <div flex>
    <ResourceFileRowCopyToClipboardButton :row-ids="[row.id]" />
    <ResourceFileRowEditDialogButton :columns :index :row />
    <ResourceFileRowDeleteDialogButton :id="row.id" :index />
  </div>
</template>
