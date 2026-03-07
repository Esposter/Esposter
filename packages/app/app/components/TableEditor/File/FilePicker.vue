<script setup lang="ts">
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { useFileTableEditorStore } from "@/store/tableEditor/file";

interface FilePickerProps {
  dataSourceType: DataSourceType;
  itemOptions: Record<string, unknown>;
}

const { dataSourceType, itemOptions } = defineProps<FilePickerProps>();
const store = useFileTableEditorStore();
const { importFile } = store;
const dataSourceConfiguration = computed(() => DataSourceConfigurationMap[dataSourceType]);
const file = ref<File | null>(null);
</script>

<template>
  <StyledDialog
    :card-props="{ title: `Import ${dataSourceType} File` }"
    :confirm-button-props="{ text: 'Import' }"
    @submit="
      async (_, onComplete) => {
        const currentConfiguration = dataSourceConfiguration;
        const currentFile = file;
        if (currentConfiguration && currentFile) {
          const item = currentConfiguration.createItem();
          Object.assign(item, itemOptions);
          await importFile(currentFile, item);
        }
        onComplete();
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-btn prepend-icon="mdi-upload" variant="outlined" @click="updateIsOpen(true)">Upload File</v-btn>
    </template>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-file-input
            :accept="dataSourceConfiguration?.accept"
            :label="`Select ${dataSourceType} file`"
            density="compact"
            hide-details
            @update:model-value="file = Array.isArray($event) ? ($event[0] ?? null) : ($event ?? null)"
          />
        </v-col>
      </v-row>
    </v-container>
  </StyledDialog>
</template>
