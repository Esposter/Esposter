<script setup lang="ts" generic="TDataSourceItem extends DataSourceItem">
import type { DataSourceItem } from "#shared/models/resource/file/datasource/DataSourceItem";

import { zodToJsonSchema } from "@/services/jsonSchema/zodToJsonSchema";
import { useRowStore } from "@/store/resource/file/row";
import { Vjsf } from "@koumoul/vjsf";

const modelValue = defineModel<TDataSourceItem>({ required: true });
const configuration = useDataSourceConfiguration(modelValue);
const schema = computed(() => zodToJsonSchema(configuration.value.schema));
const openPanels = ref(["columns", "data"]);
const rowStore = useRowStore();
const { filteredRows } = storeToRefs(rowStore);
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
        <ResourceFileMetadataBar :metadata="modelValue.dataSource.metadata" />
      </v-col>
      <v-col cols="12">
        <v-expansion-panels v-model="openPanels" multiple>
          <v-expansion-panel value="columns">
            <template #title>
              Columns
              <v-spacer />
              <ResourceFileColumnCreateDialogButton :data-source="modelValue.dataSource" />
            </template>
            <v-expansion-panel-text>
              <ResourceFileColumnTable :data-source="modelValue.dataSource" />
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel value="data">
            <template #title>
              Data
              <v-spacer />
              <ResourceFileStatisticsBar
                mr-4
                :filtered-row-count="filteredRows.length"
                :statistics="modelValue.dataSource.statistics"
              />
            </template>
            <v-expansion-panel-text>
              <ResourceFileRowTable :data-source="modelValue.dataSource" />
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-col>
    </template>
    <v-col v-else cols="12">
      <ResourceFileEmptyState :type="modelValue.type" />
    </v-col>
  </v-row>
</template>
