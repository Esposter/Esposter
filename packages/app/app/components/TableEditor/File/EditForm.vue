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
const openPanels = ref(["fields", "data"]);

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
        <v-expansion-panels v-model="openPanels" multiple>
          <v-expansion-panel title="Fields" value="fields">
            <v-expansion-panel-text>
              <TableEditorFileColumnTable />
            </v-expansion-panel-text>
          </v-expansion-panel>
          <v-expansion-panel title="Data" value="data">
            <v-expansion-panel-text>
              <TableEditorFileDataTable :data-source />
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
