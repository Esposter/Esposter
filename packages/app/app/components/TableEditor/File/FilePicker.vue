<script setup lang="ts">
import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { useFileTableEditorStore } from "@/store/tableEditor/file";
import { useTableEditorStore } from "@/store/tableEditor";

interface FilePickerProps {
  dataSourceType: DataSourceType;
  itemOptions: Record<string, unknown>;
}

const { dataSourceType, itemOptions } = defineProps<FilePickerProps>();
const tableEditorStore = useTableEditorStore<ADataSourceItem<DataSourceType>>();
const { editedItem } = storeToRefs(tableEditorStore);
const fileTableEditorStore = useFileTableEditorStore();
const { setDataSource } = fileTableEditorStore;
const dataSourceConfiguration = computed(() => DataSourceConfigurationMap[dataSourceType]);
const file = ref<File | null>(null);
const handleImport = async (onComplete: () => void) => {
  const currentConfiguration = dataSourceConfiguration.value;
  const currentFile = file.value;
  if (!currentConfiguration || !currentFile) {
    onComplete();
    return;
  }
  const item = currentConfiguration.createItem();
  Object.assign(item, itemOptions);
  const result = await currentConfiguration.parse(currentFile, item);
  item.name = result.metadata.name;
  editedItem.value = item;
  setDataSource(result);
  onComplete();
};
</script>

<template>
  <StyledDialog
    :card-props="{ title: `Import ${dataSourceType} File` }"
    :confirm-button-props="{ text: 'Import' }"
    @submit="(_, onComplete) => handleImport(onComplete)"
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
