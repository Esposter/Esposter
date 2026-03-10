<script setup lang="ts">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { DataSourceConfiguration } from "@/models/tableEditor/file/DataSourceConfiguration";

import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { useTableEditorStore } from "@/store/tableEditor";

type AnyDataSourceItem = DataSourceItemTypeMap[keyof DataSourceItemTypeMap];

const tableEditorStore = useTableEditorStore<AnyDataSourceItem>();
const { editedItem } = storeToRefs(tableEditorStore);
const { setDataSource } = useEditedItemDataSource();
const importFile = useImportFile();
const configuration = computed(() =>
  editedItem.value
    ? (DataSourceConfigurationMap[editedItem.value.type] as DataSourceConfiguration<AnyDataSourceItem>)
    : null,
);
</script>

<template>
  <v-btn
    v-if="editedItem && configuration"
    prepend-icon="mdi-upload"
    @click="
      async () => {
        await importFile(configuration.mimeType, configuration.accept, async (file) => {
          const result = await (
            configuration.deserialize as (file: File, item: AnyDataSourceItem) => Promise<DataSource>
          )(file, editedItem);
          editedItem.name = result.metadata.name;
          setDataSource(result);
        });
      }
    "
  >
    Import
  </v-btn>
</template>
