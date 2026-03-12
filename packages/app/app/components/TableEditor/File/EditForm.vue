<script setup lang="ts" generic="TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]">
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { Vjsf } from "@koumoul/vjsf";

const modelValue = defineModel<TDataSourceItem>({ required: true });
const configuration = useDataSourceConfiguration(modelValue);
const schema = computed(() => zodToJsonSchema(configuration.value.schema));
const openPanels = ref(["columns", "data"]);
</script>

<template>
  <v-row>
    <v-col cols="12">
      <v-text-field v-model="modelValue.name" label="Name" />
    </v-col>
    <v-col cols="12">
      <Vjsf v-model="modelValue.configuration" :schema />
    </v-col>
    <template v-if="modelValue.dataSource">
      <v-col cols="12">
        <TableEditorFileMetadataBar :metadata="modelValue.dataSource.metadata" />
      </v-col>
      <v-col cols="12">
        <v-expansion-panels v-model="openPanels" multiple>
          <v-expansion-panel title="Columns" value="columns">
            <v-expansion-panel-text>
              <TableEditorFileColumnTable :data-source="modelValue.dataSource" />
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel value="data">
            <template #title>
              Data
              <v-spacer />
              <TableEditorFileStatsBar :stats="modelValue.dataSource.stats" />
            </template>
            <v-expansion-panel-text>
              <TableEditorFileDataTable :data-source="modelValue.dataSource" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </template>
    <v-col v-else cols="12">
      <TableEditorFileEmptyState :type="modelValue.type" />
    </v-col>
  </v-row>
</template>
