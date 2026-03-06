<script setup lang="ts">
import type { CsvOptions } from "#shared/models/tableEditor/file/CsvOptions";

import { CsvDelimiter } from "#shared/models/tableEditor/file/CsvDelimiter";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { useFileTableEditorStore } from "@/store/tableEditor/file";

const modelValue = defineModel<boolean>();
const store = useFileTableEditorStore();
const { selectedDataSourceType } = storeToRefs(store);
const file = ref<File | null>(null);
const csvOptions = ref<CsvOptions>({ delimiter: CsvDelimiter.Comma });
const accept = computed(() => {
  if (selectedDataSourceType.value === DataSourceType.Csv) return ".csv";
  else if (selectedDataSourceType.value === DataSourceType.Excel) return ".xlsx,.xls,.ods";
  else return undefined;
});
</script>

<template>
  <StyledDialog
    v-model="modelValue"
    :card-props="{ title: `Import ${selectedDataSourceType}` }"
    :confirm-button-props="{ disabled: !file, text: 'Import' }"
    @submit="
      async (_event, onComplete) => {
        if (file) await store.importFile(file, csvOptions);
        onComplete();
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-btn prepend-icon="mdi-upload" @click="updateIsOpen(true)">Import</v-btn>
    </template>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-file-input
            :accept
            :label="`Select ${selectedDataSourceType} file`"
            density="compact"
            hide-details
            @update:model-value="file = Array.isArray($event) ? ($event[0] ?? null) : ($event ?? null)"
          />
        </v-col>
        <v-col v-if="selectedDataSourceType === DataSourceType.Csv" cols="12">
          <TableEditorFileImportCsvForm v-model="csvOptions" />
        </v-col>
      </v-row>
    </v-container>
  </StyledDialog>
</template>
