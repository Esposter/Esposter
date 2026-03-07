<script setup lang="ts" generic="TDataSourceItem extends ADataSourceItem<DataSourceType>">
import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

import { zodToJsonSchema } from "@/services/dashboard/jsonSchema/zodToJsonSchema";
import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { useFileTableEditorStore } from "@/store/tableEditor/file";
import { Vjsf } from "@koumoul/vjsf";

const modelValue = defineModel<TDataSourceItem>({ required: true });
const fileTableEditorStore = useFileTableEditorStore();
const { dataSource } = storeToRefs(fileTableEditorStore);
const configuration = computed(() => DataSourceConfigurationMap[modelValue.value.type]);
const schema = computed(() => zodToJsonSchema(configuration.value.schema));
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
