<script setup lang="ts" generic="TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]">
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { DataSourceConfiguration } from "@/models/tableEditor/file/DataSourceConfiguration";

import { useFileTableEditorStore } from "@/store/tableEditor/file";

interface FilePickerProps {
  configuration: DataSourceConfiguration<TDataSourceItem>;
}

const modelValue = defineModel<TDataSourceItem>({ required: true });
const { configuration } = defineProps<FilePickerProps>();
const fileTableEditorStore = useFileTableEditorStore();
const { setDataSource } = fileTableEditorStore;
const file = ref<File | null>(null);
const formattedFileSize = computed(() => {
  if (!file.value) return null;
  const bytes = file.value.size;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
});
</script>

<template>
  <StyledDialog
    :card-props="{ title: `Import ${modelValue.type} File` }"
    :confirm-button-props="{ text: 'Import' }"
    @submit="
      async (_, onComplete) => {
        if (!file) {
          onComplete();
          return;
        }

        const result = await configuration.parse(file, modelValue);
        modelValue.name = result.metadata.name;
        setDataSource(result);
        onComplete();
      }
    "
  >
    <template #activator="{ updateIsOpen }">
      <v-btn block prepend-icon="mdi-upload" variant="outlined" @click="updateIsOpen(true)">Upload File</v-btn>
    </template>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-file-input
            :accept="configuration.accept"
            :label="`Select ${modelValue.type} file`"
            hide-details
            @update:model-value="file = Array.isArray($event) ? ($event[0] ?? null) : ($event ?? null)"
          />
        </v-col>
        <template v-if="file && formattedFileSize">
          <v-col cols="12">
            <v-list-item :subtitle="formattedFileSize" :title="file.name" prepend-icon="mdi-file-outline" />
          </v-col>
        </template>
      </v-row>
    </v-container>
  </StyledDialog>
</template>
