<script setup lang="ts" generic="TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]">
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

const modelValue = defineModel<TDataSourceItem>({ required: true });
const { setDataSource } = useEditedItemDataSource();
const importFile = useImportFile();
const dataSourceConfiguration = useDataSourceConfiguration(modelValue);
</script>

<template>
  <v-btn
    prepend-icon="mdi-upload"
    @click="
      async () => {
        await importFile(dataSourceConfiguration.mimeType, dataSourceConfiguration.accept, async (file) => {
          const result = await dataSourceConfiguration.deserialize(file, modelValue);
          modelValue.name = result.metadata.name;
          setDataSource(result);
        });
      }
    "
  >
    Import
  </v-btn>
</template>
