<script setup lang="ts" generic="TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]">
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { trimFileExtension } from "@/util/trimFileExtension";

const modelValue = defineModel<TDataSourceItem>({ required: true });
const { setDataSource } = useEditedItemDataSource();
const importFile = useImportFile();
const dataSourceConfiguration = useDataSourceConfiguration(modelValue);
</script>

<template>
  <v-tooltip :text="`Import ${modelValue.type}`">
    <template #activator="{ props }">
      <v-btn
        icon="mdi-upload"
        :="props"
        @click="
          async () => {
            await importFile(dataSourceConfiguration.mimeType, dataSourceConfiguration.accept, async (file) => {
              const result = await dataSourceConfiguration.deserialize(file, modelValue);
              modelValue.name = trimFileExtension(result.metadata.name);
              setDataSource(result);
            });
          }
        "
      />
    </template>
  </v-tooltip>
</template>
