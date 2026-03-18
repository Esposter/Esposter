<script setup lang="ts" generic="TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]">
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore<TDataSourceItem>();
const { editedItem } = storeToRefs(tableEditorStore);
const { clear } = useDataSourceHistory();

watch(
  () => editedItem.value?.id,
  () => clear(),
);
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
