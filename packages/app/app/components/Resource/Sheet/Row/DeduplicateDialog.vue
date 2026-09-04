<script setup lang="ts">
import type { IndexedRow } from "@/models/resource/sheet/commands/IndexedRow";

import { pluralize } from "#shared/util/text/pluralize";
import { KeepDuplicateMode } from "@/models/resource/sheet/commands/KeepDuplicateMode";
import { getVisibleColumns } from "@/services/resource/sheet/column/getVisibleColumns";
import { findDuplicateRows } from "@/services/resource/sheet/commands/findDuplicateRows";
import { useSheetStore } from "@/store/resource/sheet";
import { takeOne } from "@esposter/shared";

const KEEP_DUPLICATE_MODES = Object.values(KeepDuplicateMode);
const sheetStore = useSheetStore();
const { dataSource } = storeToRefs(sheetStore);
const isOpen = defineModel<boolean>({ default: false });
const keepMode = ref(KeepDuplicateMode.First);
const deleteDuplicateRows = useDeleteDuplicateRows();
const duplicateRows = computed<IndexedRow[]>(() => findDuplicateRows(dataSource.value, keepMode.value));
const duplicateCount = computed(() => duplicateRows.value.length);
const duplicateHeaders = computed(() => [
  { key: "index", title: "#", value: (indexedRow: IndexedRow) => indexedRow.index },
  ...getVisibleColumns(dataSource.value.columns).map((column) => ({
    key: column.name,
    title: column.name,
    value: (indexedRow: IndexedRow) => {
      const value = takeOne(indexedRow.row.data, column.name);
      return value === null ? "" : String(value);
    },
  })),
]);
</script>

<template>
  <ResourceSheetDialog v-model="isOpen" close-button-text="Cancel" title="Duplicate Rows">
    <span v-if="duplicateCount === 0">No duplicate rows found.</span>
    <template v-else>
      <span>{{ duplicateCount }} duplicate {{ pluralize("row", duplicateCount) }} will be deleted.</span>
      <v-btn-toggle v-model="keepMode" density="compact" mandatory mt-4>
        <v-btn v-for="mode of KEEP_DUPLICATE_MODES" :key="mode" :value="mode">Keep {{ mode }}</v-btn>
      </v-btn-toggle>
      <v-data-table mt-4 density="compact" item-value="index" :headers="duplicateHeaders" :items="duplicateRows" />
    </template>
    <template #actions>
      <v-btn
        color="error"
        :disabled="duplicateCount === 0"
        @click="
          () => {
            deleteDuplicateRows(keepMode);
            isOpen = false;
          }
        "
      >
        Delete Duplicates
      </v-btn>
    </template>
  </ResourceSheetDialog>
</template>
