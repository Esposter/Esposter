<script setup lang="ts" generic="TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]">
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/datasource/DataSourceItemTypeMap";

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
