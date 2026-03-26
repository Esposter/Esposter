<script setup lang="ts" generic="TDataSourceItem extends DataSourceItem">
import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { useTableEditorStore } from "@/store/tableEditor";
import { useFileHistoryStore } from "@/store/tableEditor/fileHistory";

const tableEditorStore = useTableEditorStore<TDataSourceItem>();
const { editedItem } = storeToRefs(tableEditorStore);
useFileHistoryStore();
</script>

<template>
  <TableEditorCrudViewHeader>
    <template v-if="editedItem" #prepend-actions>
      <TableEditorFileCrudViewUndoButton />
      <TableEditorFileCrudViewRedoButton />
      <TableEditorFileCrudViewImportButton v-model="editedItem" />
      <TableEditorFileCrudViewExportButton :edited-item />
    </template>
  </TableEditorCrudViewHeader>
</template>
