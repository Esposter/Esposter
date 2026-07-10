<script setup lang="ts" generic="TDataSourceItem extends DataSourceItem">
import type { DataSourceItem } from "#shared/models/resource/file/datasource/DataSourceItem";

import { useFileStore } from "@/store/resource/file";
import { useFileHistoryStore } from "@/store/resource/file/history";

const fileStore = useFileStore();
const { dataSource } = storeToRefs(fileStore);
useFileHistoryStore();
</script>

<template>
  <TableEditorCrudViewHeader>
    <template v-if="editedItem" #prepend-actions>
      <ResourceFileCrudViewUndoButton />
      <ResourceFileCrudViewRedoButton />
      <ResourceFileCrudViewImportButton v-model="editedItem" />
      <ResourceFileCrudViewImportDatasetButton v-model="editedItem" />
      <ResourceFileCrudViewExportButton :edited-item />
    </template>
  </TableEditorCrudViewHeader>
</template>
