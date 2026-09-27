<script setup lang="ts">
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { pluralize } from "#shared/util/text/pluralize";
import { useRowDialogStore } from "@/store/resource/sheet/rowDialog";

interface Props {
  dataSource: DataSource;
}

const { dataSource } = defineProps<Props>();
const rowDialogStore = useRowDialogStore();
const { deletingIds } = storeToRefs(rowDialogStore);
const deleteRow = useDeleteRow();
const deleteRows = useDeleteRows();
// The rows still in the sheet, so one an edit elsewhere removed meanwhile is not counted
const deletingRowIds = computed(() =>
  dataSource.rows.filter(({ id }) => deletingIds.value.includes(id)).map(({ id }) => id),
);
const isOpen = computed({
  get: () => deletingRowIds.value.length > 0,
  set: (newIsOpen) => {
    if (!newIsOpen) deletingIds.value = [];
  },
});
</script>

<template>
  <UiConfirmDialog
    v-if="deletingRowIds.length > 0"
    v-model="isOpen"
    confirm-label="Delete"
    :title="`Delete ${pluralize('row', deletingRowIds.length)}`"
    :confirm="
      () => {
        const [firstId] = deletingRowIds;
        return deletingRowIds.length === 1 && firstId ? deleteRow(firstId) : deleteRows(deletingRowIds);
      }
    "
    is-optimistic
  >
    <p>
      Delete {{ deletingRowIds.length === 1 ? "this row" : `${deletingRowIds.length} rows` }}? The toolbar's Undo brings
      {{ deletingRowIds.length === 1 ? "it" : "them" }} back.
    </p>
  </UiConfirmDialog>
</template>
