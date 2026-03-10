<script setup lang="ts" generic="TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]">
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { DataSourceConfiguration } from "@/models/tableEditor/file/DataSourceConfiguration";

import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { useTableEditorStore } from "@/store/tableEditor";

const tableEditorStore = useTableEditorStore<TDataSourceItem>();
const { editedItem } = storeToRefs(tableEditorStore);
const { setDataSource } = useEditedItemDataSource();
const importFile = useImportFile();
</script>

<template>
  <v-btn
    prepend-icon="mdi-upload"
    @click="
      async () => {
        if (!editedItem) return;
        const configuration = DataSourceConfigurationMap[editedItem.type];
        const editedItemValue = editedItem;
        await importFile(configuration.mimeType, configuration.accept, async (file) => {
          const result = await configuration.deserialize(file, editedItemValue);
          editedItemValue.name = result.metadata.name;
          setDataSource(result);
        });
      }
    "
  >
    Import
  </v-btn>
</template>
