<script setup lang="ts">
import type { CsvDataSourceItem } from "#shared/models/tableEditor/file/CsvDataSourceItem";

import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { useFileTableEditorStore } from "@/store/tableEditor/file";
import { Vjsf } from "@koumoul/vjsf";

const modelValue = defineModel<CsvDataSourceItem>({ required: true });
const fileTableEditorStore = useFileTableEditorStore();
const { dataSource } = storeToRefs(fileTableEditorStore);
const csvConfiguration = DataSourceConfigurationMap[DataSourceType.Csv];
const { schema } = csvConfiguration;
</script>

<template>
  <v-row>
    <v-col cols="12">
      <Vjsf v-model="modelValue" :schema />
    </v-col>
    <v-col cols="12">
      <TableEditorFileFilePicker v-model="modelValue" :configuration="csvConfiguration" />
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
