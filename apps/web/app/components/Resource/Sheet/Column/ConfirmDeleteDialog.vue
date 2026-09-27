<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { pluralize } from "#shared/util/text/pluralize";
import { useColumnDialogStore } from "@/store/resource/sheet/columnDialog";

interface Props {
  dataSource: DataSource;
}

const { dataSource } = defineProps<Props>();
const columnDialogStore = useColumnDialogStore();
const { deletingColumnIds } = storeToRefs(columnDialogStore);
const deleteColumn = useDeleteColumn();
const deleteColumns = useDeleteColumns();
// The columns still in the sheet, so one an edit elsewhere removed meanwhile is not counted
const deletingColumns = computed(() => dataSource.columns.filter(({ id }) => deletingColumnIds.value.includes(id)));
const isOpen = computed({
  get: () => deletingColumns.value.length > 0,
  set: (newIsOpen) => {
    if (!newIsOpen) deletingColumnIds.value = [];
  },
});
</script>

<template>
  <UiConfirmDialog
    v-if="deletingColumns.length > 0"
    v-model="isOpen"
    confirm-label="Delete"
    :title="`Delete ${pluralize('column', deletingColumns.length)}`"
    :confirm="
      () => {
        const [firstColumn] = deletingColumns;
        return deletingColumns.length === 1 && firstColumn
          ? deleteColumn(firstColumn.name)
          : deleteColumns(deletingColumns.map(({ id }) => id));
      }
    "
    is-optimistic
  >
    <p>
      Delete {{ deletingColumns.length === 1 ? deletingColumns[0]?.name : `${deletingColumns.length} columns` }} and
      {{ deletingColumns.length === 1 ? "its" : "their" }} values? The toolbar's Undo brings
      {{ deletingColumns.length === 1 ? "it" : "them" }} back.
    </p>
  </UiConfirmDialog>
</template>
