<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";

import { useRowStore } from "@/store/tableEditor/file/row";

interface TextSlotProps {
  dataSource: DataSource;
}

const { dataSource } = defineProps<TextSlotProps>();
const rowStore = useRowStore();
const { search } = storeToRefs(rowStore);
</script>

<template>
  <div flex items-center gap-2>
    <v-text-field v-model="search" prepend-inner-icon="mdi-magnify" hide-details single-line />
    <TableEditorFileFindReplaceDialogButton />
  </div>
  <TableEditorFileFindReplaceBar />
  <div flex flex-wrap items-center gap-1>
    <TableEditorFileRowCopyToClipboardButton />
    <TableEditorFileRowPasteFromClipboardButton />
    <TableEditorFileColumnStatisticsDialogButton />
    <TableEditorFileRowOutlierToggleButton />
    <TableEditorFileRowClearFiltersButton />
    <TableEditorFileRowStringTransformationDialogButton />
    <TableEditorFileRowNullStrategyDialogButton />
    <TableEditorFileRowDeduplicateDialogButton />
    <TableEditorFileRowCreateDialogButton :data-source />
    <TableEditorFileRowCopyIncludesHeadersButton />
  </div>
</template>
