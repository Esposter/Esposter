<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { pluralize } from "#shared/util/text/pluralize";
import { useColumnDialogStore } from "#src/store/resource/sheet/columnDialog";

interface Props {
  dataSource: DataSource;
}

const { dataSource } = defineProps<Props>();
const columnDialogStore = useColumnDialogStore();
const { deletingColumnIds } = storeToRefs(columnDialogStore);
const deleteColumn = useDeleteColumn();
const deleteColumns = useDeleteColumns();
// The columns still in the sheet, so one an edit elsewhere removed meanwhile is not counted
const { isOpen, item: deletingColumns } = useSingletonDialog(deletingColumnIds, () =>
  dataSource.columns.filter(({ id }) => deletingColumnIds.value.includes(id)),
);
const isSingleColumn = computed(() => deletingColumns.value?.length === 1);
</script>

<template>
  <UiConfirmDialog
    v-if="deletingColumns?.length"
    v-model="isOpen"
    confirm-label="Delete"
    :title="`Delete ${pluralize('column', deletingColumns.length)}`"
    :confirm="
      () => {
        if (!deletingColumns) return;
        const [firstColumn] = deletingColumns;
        return deletingColumns.length === 1 && firstColumn
          ? deleteColumn(firstColumn.name)
          : deleteColumns(deletingColumns.map(({ id }) => id));
      }
    "
  >
    <p>
      Delete {{ isSingleColumn ? deletingColumns[0]?.name : `${deletingColumns.length} columns` }} and
      {{ isSingleColumn ? "its" : "their" }} values? The toolbar's Undo brings
      {{ isSingleColumn ? "it" : "them" }} back.
    </p>
  </UiConfirmDialog>
</template>
