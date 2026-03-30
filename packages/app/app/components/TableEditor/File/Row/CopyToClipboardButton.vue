<script setup lang="ts">
import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { useTableEditorStore } from "@/store/tableEditor";

interface CopyToClipboardButtonProps {
  rowIds?: string[];
}

const { rowIds } = defineProps<CopyToClipboardButtonProps>();
const copyToClipboard = useCopyToClipboard();
const tableEditorStore = useTableEditorStore<DataSourceItem>();
const { editedItem } = storeToRefs(tableEditorStore);
const text = computed(() => {
  if (!rowIds) return "Copy all rows to Clipboard";
  const rows = editedItem.value?.dataSource?.rows ?? [];
  const indices = rowIds.map((id) => rows.findIndex((row) => row.id === id) + 1).filter((index) => index > 0);
  return `Copy row${indices.length === 1 ? "" : "s"} ${indices.join(", ")} to Clipboard`;
});
</script>

<template>
  <v-tooltip :text>
    <template #activator="{ props: tooltipProps }">
      <v-btn m-0 icon="mdi-content-copy" size="small" tile :="tooltipProps" @click.stop="copyToClipboard(rowIds)" />
    </template>
  </v-tooltip>
</template>
