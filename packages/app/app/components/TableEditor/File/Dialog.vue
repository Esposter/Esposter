<script setup lang="ts">
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { useFileTableEditorStore } from "@/store/tableEditor/file";
import { Vjsf } from "@koumoul/vjsf";

interface DialogProps {
  dataSourceType: DataSourceType;
}

const { dataSourceType } = defineProps<DialogProps>();
const store = useFileTableEditorStore();
const { saveItem } = store;
const dataSourceConfiguration = computed(() => DataSourceConfigurationMap[dataSourceType]);
const getInitialOptions = () => {
  const defaultItem = dataSourceConfiguration.value.createItem();
  const { properties } = dataSourceConfiguration.value.schema;
  return Object.fromEntries(Object.keys(properties).map((key) => [key, defaultItem[key]]));
};
const itemOptions = ref<Record<string, unknown>>(getInitialOptions());
</script>

<template>
  <StyledDialog
    :card-props="{ title: dataSourceType }"
    @submit="
      (_, onComplete) => {
        saveItem();
        onComplete();
      }
    "
  >
    <v-container fluid>
      <v-row>
        <v-col v-if="dataSourceConfiguration?.schema && Object.keys(itemOptions).length > 0" cols="12">
          <Vjsf v-model="itemOptions" :schema="dataSourceConfiguration.schema" :options="{ removeAdditional: true }" />
        </v-col>
        <v-col cols="12">
          <TableEditorFileFilePicker :data-source-type :item-options />
        </v-col>
        <v-col cols="12">
          <TableEditorFileColumnTable />
        </v-col>
      </v-row>
    </v-container>
  </StyledDialog>
</template>
