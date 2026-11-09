<script setup lang="ts">
import type { IndexedRow } from "@/models/resource/sheet/commands/IndexedRow";
import type { UiDataTableColumn } from "@/models/ui/UiDataTableColumn";

import { pluralize } from "#shared/util/text/pluralize";
import { KeepDuplicateMode, KeepDuplicateModes } from "@/models/resource/sheet/commands/KeepDuplicateMode";
import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
import { UiDialogSize } from "@/models/ui/UiDialogSize";
import { UiIconMeaning } from "@/models/ui/UiIconMeaning";
import { getVisibleEditableColumns } from "@/services/resource/sheet/column/getVisibleEditableColumns";
import { findDuplicateRows } from "@/services/resource/sheet/commands/findDuplicateRows";
import { useSheetStore } from "@/store/resource/sheet";
import { takeOne } from "@esposter/shared";

const isOpen = defineModel<boolean>({ default: false });
const sheetStore = useSheetStore();
const { dataSource } = storeToRefs(sheetStore);
const keepMode = ref(KeepDuplicateMode.First);
const deleteDuplicateRows = useDeleteDuplicateRows();
const duplicateRows = computed(() => findDuplicateRows(dataSource.value, keepMode.value));
const duplicateCount = computed(() => duplicateRows.value.length);
// A duplicate is keyed by the row it would delete, which the preview table reads its rows by
const duplicateItems = computed(() =>
  duplicateRows.value.map((indexedRow) => ({ ...indexedRow, id: indexedRow.row.id })),
);
const duplicateColumns = computed<UiDataTableColumn<IndexedRow & { id: string }>[]>(() => [
  { getValue: ({ index }) => String(index + 1), isSortable: false, key: "index", title: "#" },
  ...getVisibleEditableColumns(dataSource.value.columns).map((column) => ({
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
  <UiDialog v-model="isOpen" :placement="UiDialogPlacement.Middle" title="Duplicate rows" :size="UiDialogSize.Large">
    <!-- The dialog stays in the document while closed, so its body mounts only while it is open: its reads cost
      Nothing until then -->
    <template v-if="isOpen">
      <UiEmptyState
        v-if="duplicateCount === 0"
        description="Every row in the sheet is already unique"
        :meaning="UiIconMeaning.Success"
        title="No duplicate rows"
      />
      <template v-else>
        <div flex gap-3 items-center justify-between>
          <p min-w-0>{{ duplicateCount }} duplicate {{ pluralize("row", duplicateCount) }} will be deleted.</p>
          <UiToggleGroup v-model="keepMode" :items="keepModeItems" label="Which copy to keep" />
        </div>
        <UiDataTable
          :columns="duplicateColumns"
          :get-item-title="({ index }) => `Row ${index + 1}`"
          :items="duplicateItems"
          label="Rows that will be deleted"
        />
      </template>
    </template>
    <template v-if="isOpen" #footer>
      <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
      <!-- eslint-disable vue/no-restricted-syntax -- this dialog is the confirm: the rows it deletes are listed above the button -->
      <UiButton
        :disabled="duplicateCount === 0"
        :variant="UiButtonVariant.Danger"
        @click="
          () => {
            deleteDuplicateRows(keepMode);
            isOpen = false;
          }
        "
      >
        Delete duplicates
      </UiButton>
      <!-- eslint-enable vue/no-restricted-syntax -->
    </template>
  </UiDialog>
</template>
