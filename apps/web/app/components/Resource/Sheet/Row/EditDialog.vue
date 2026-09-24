<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { rowSchema } from "#shared/models/resource/sheet/datasource/Row";
import { getRowFormColumns } from "@/services/resource/sheet/column/getRowFormColumns";
import { getEditRowDescription } from "@/services/resource/sheet/commands/getEditRowDescription";
import { useRowDialogStore } from "@/store/resource/sheet/rowDialog";
import { takeOne, toRawDeep } from "@esposter/shared";

interface Props {
  columns: DataSource["columns"];
  index: number;
  row: DataSource["rows"][number];
}

const { columns, index, row } = defineProps<Props>();
const rowDialogStore = useRowDialogStore();
const { editingId } = storeToRefs(rowDialogStore);
const { isOpen } = useSingletonDialog(editingId);
const rowFormColumns = computed(() => getRowFormColumns(columns));
const updateRow = useUpdateRow();
const { cloned: editedRow, sync: resetForm } = useCloned(() => row, {
  clone: (source) => structuredClone(toRawDeep(source)),
  deep: true,
});
</script>

<template>
  <ResourceSheetEditDialog
    v-model="isOpen"
    :title="getEditRowDescription(index)"
    :value="row"
    :edited-value="editedRow"
    :schema="rowSchema"
    @reset="resetForm()"
    @submit="
      (onComplete) => {
        updateRow(editedRow);
        onComplete();
      }
    "
  >
    <ResourceSheetRowFieldInput
      v-for="column of rowFormColumns"
      :key="column.id"
      :model-value="takeOne(editedRow.data, column.name)"
      :column
      @update:model-value="editedRow.data[column.name] = $event"
    />
  </ResourceSheetEditDialog>
</template>
