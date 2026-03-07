<script setup lang="ts" generic="TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]">
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { zodToJsonSchema } from "@/services/dashboard/jsonSchema/zodToJsonSchema";
import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { useFileTableEditorStore } from "@/store/tableEditor/file";
import { Vjsf } from "@koumoul/vjsf";

const modelValue = defineModel<TDataSourceItem>({ required: true });
const fileTableEditorStore = useFileTableEditorStore();
const { reset } = fileTableEditorStore;
const { dataSource } = storeToRefs(fileTableEditorStore);
const configuration = computed(() => DataSourceConfigurationMap[modelValue.value.type]);
const schema = computed(() => zodToJsonSchema(configuration.value.schema));

onUnmounted(() => {
  reset();
});
</script>

<template>
  <v-row>
    <v-col cols="12">
      <Vjsf v-model="modelValue.configuration" :schema />
    </v-col>
    <v-col cols="12">
      <TableEditorFilePicker v-model="modelValue" :configuration />
    </v-col>
    <template v-if="dataSource">
      <v-col cols="12">
        <TableEditorFileMetadataBar :metadata="dataSource.metadata" />
      </v-col>
      <v-col cols="12">
        <TableEditorFileColumnTable />
      </v-col>
      <v-col cols="12">
        <TableEditorFileDataTable :data-source />
      </v-col>
    </template>
    <v-col v-else cols="12">
      <TableEditorFileEmptyState />
    </v-col>
  </v-row>
</template>
