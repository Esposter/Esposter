<script setup lang="ts">
import type { IndexedRow } from "@/models/resource/file/commands/IndexedRow";

import { KeepDuplicateMode } from "@/models/resource/file/commands/KeepDuplicateMode";
import { findDuplicateRows } from "@/services/resource/file/commands/findDuplicateRows";
import { useFileStore } from "@/store/resource/file";
import { takeOne } from "@esposter/shared";

const fileStore = useFileStore();
const { dataSource } = storeToRefs(fileStore);
const isOpen = ref(false);
const keepMode = ref(KeepDuplicateMode.First);
const deleteDuplicateRows = useDeleteDuplicateRows();
const duplicateRowEntries = computed<IndexedRow[]>(() => findDuplicateRows(dataSource.value, keepMode.value));
const duplicateCount = computed(() => duplicateRowEntries.value.length);
const duplicateHeaders = computed(() => [
  { key: "index", title: "#", value: (entry: IndexedRow) => entry.index },
  ...dataSource.value.columns
    .filter((column) => !column.hidden)
    .map((column) => ({
      key: column.name,
      title: column.name,
      value: (entry: IndexedRow) => {
        const value = takeOne(entry.row.data, column.name);
        return value === null ? "" : String(value);
      },
    })),
]);
</script>

<template>
  <StyledTooltipIconButton
    :button-props="{ class: 'm-0', size: 'small', tile: true }"
    icon="mdi-table-row-remove"
    text="Remove Duplicate Rows"
    @click.stop="isOpen = true"
  />
  <ResourceFileDialog v-model="isOpen" close-button-text="Cancel" title="Duplicate Rows">
    <span v-if="duplicateCount === 0">No duplicate rows found.</span>
    <template v-else>
      <span>{{ duplicateCount }} duplicate row{{ duplicateCount === 1 ? "" : "s" }} will be deleted.</span>
      <v-btn-toggle v-model="keepMode" density="compact" mandatory mt-4>
        <v-btn :value="KeepDuplicateMode.First">Keep First</v-btn>
        <v-btn :value="KeepDuplicateMode.Last">Keep Last</v-btn>
      </v-btn-toggle>
      <v-data-table
        mt-4
        density="compact"
        item-value="index"
        :headers="duplicateHeaders"
        :items="duplicateRowEntries"
      />
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
  </ResourceFileDialog>
</template>
