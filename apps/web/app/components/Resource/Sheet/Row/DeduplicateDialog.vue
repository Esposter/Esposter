<script setup lang="ts">
import type { IndexedRow } from "@/models/resource/sheet/commands/IndexedRow";
import type { UiDataTableColumn } from "@/models/ui/UiDataTableColumn";

import { pluralize } from "#shared/util/text/pluralize";
import { KeepDuplicateMode, KeepDuplicateModes } from "@/models/resource/sheet/commands/KeepDuplicateMode";
import { getVisibleColumns } from "@/services/resource/sheet/column/getVisibleColumns";
import { findDuplicateRows } from "@/services/resource/sheet/commands/findDuplicateRows";
import { useSheetStore } from "@/store/resource/sheet";
import { takeOne } from "@esposter/shared";

const sheetStore = useSheetStore();
const { dataSource } = storeToRefs(sheetStore);
const isOpen = defineModel<boolean>({ default: false });
const keepMode = ref(KeepDuplicateMode.First);
const deleteDuplicateRows = useDeleteDuplicateRows();
const duplicateRows = computed<IndexedRow[]>(() => findDuplicateRows(dataSource.value, keepMode.value));
const duplicateCount = computed(() => duplicateRows.value.length);
// A duplicate is keyed by the row it would delete, which the preview table reads its rows by
const duplicateItems = computed(() =>
  // oxlint-disable-next-line oxc/no-map-spread -- each item is a new object, never a found duplicate mutated in place
  duplicateRows.value.map((indexedRow) => ({ ...indexedRow, id: indexedRow.row.id })),
);
const duplicateColumns = computed<UiDataTableColumn<IndexedRow & { id: string }>[]>(() => [
  { getValue: ({ index }) => String(index + 1), isSortable: false, key: "index", title: "#" },
  ...getVisibleColumns(dataSource.value.columns).map((column) => ({
    getValue: ({ row }: IndexedRow) => {
      const value = takeOne(row.data, column.name);
      return value === null ? "" : String(value);
    },
    isSortable: false as const,
    key: column.name,
    title: column.name,
  })),
]);
const keepModeItems = KeepDuplicateModes.map((mode) => ({ title: `Keep ${mode}`, value: mode }));
</script>

<template>
  <StyledDialog
    v-model="isOpen"
    :card-props="{ title: 'Duplicate rows', width: '48rem' }"
    :confirm-button-props="{ color: 'error', disabled: duplicateCount === 0, text: 'Delete duplicates' }"
    @confirm="
      (onComplete) => {
        deleteDuplicateRows(keepMode);
        onComplete();
      }
    "
  >
    <p v-if="duplicateCount === 0">No duplicate rows found.</p>
    <template v-else>
      <div flex flex-wrap gap-3 items-center justify-between>
        <p>{{ duplicateCount }} duplicate {{ pluralize("row", duplicateCount) }} will be deleted.</p>
        <UiToggleGroup v-model="keepMode" :items="keepModeItems" label="Which copy to keep" />
      </div>
      <UiDataTable
        :columns="duplicateColumns"
        :get-item-title="({ index }) => `Row ${index + 1}`"
        :items="duplicateItems"
        label="Rows that will be deleted"
      />
    </template>
  </StyledDialog>
</template>
