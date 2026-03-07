<script setup lang="ts">
import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { useTableEditorStore } from "@/store/tableEditor";
import { useFileTableEditorStore } from "@/store/tableEditor/file";
import { Vjsf } from "@koumoul/vjsf";

interface DialogProps {
  dataSourceType: DataSourceType;
}

const modelValue = defineModel<boolean>({ required: true });
const { dataSourceType } = defineProps<DialogProps>();
const tableEditorStore = useTableEditorStore<ADataSourceItem<DataSourceType>>();
const { save } = tableEditorStore;
const fileTableEditorStore = useFileTableEditorStore();
const { reset } = fileTableEditorStore;
const dataSourceConfiguration = computed(() => DataSourceConfigurationMap[dataSourceType]);
const getInitialOptions = () => {
  const defaultItem = dataSourceConfiguration.value.createItem();
  const properties = dataSourceConfiguration.value.schema.properties;
  return Object.fromEntries(Object.keys(properties).map((key) => [key, defaultItem[key as keyof typeof defaultItem]]));
};
const itemOptions = ref(getInitialOptions());

watch(modelValue, async (isOpen) => {
  if (isOpen) return;
  await reset();
});
</script>

<template>
  <StyledDialog
    v-model="modelValue"
    :card-props="{ title: dataSourceType }"
    @submit="
      (_, onComplete) => {
        save();
        onComplete();
      }
    "
  >
    <v-container fluid>
      <v-row>
        <v-col cols="12">
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
