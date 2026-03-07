<script setup lang="ts" generic="TDataSourceItem extends ADataSourceItem<DataSourceType>">
import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
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
      <v-btn prepend-icon="mdi-upload" variant="outlined" @click="updateIsOpen(true)">Upload File</v-btn>
    </template>
    <v-container fluid>
      <v-row>
        <v-col cols="12">
          <v-file-input
            :accept="configuration.accept"
            :label="`Select ${modelValue.type} file`"
            density="compact"
            hide-details
            @update:model-value="file = Array.isArray($event) ? ($event[0] ?? null) : ($event ?? null)"
          />
        </v-col>
      </v-row>
    </v-container>
  </StyledDialog>
</template>
