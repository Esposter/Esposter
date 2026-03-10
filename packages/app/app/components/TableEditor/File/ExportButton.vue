<script setup lang="ts">
import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { DataSourceTypeItemCategoryDefinitions } from "@/services/tableEditor/file/DataSourceTypeItemCategoryDefinitions";
import { useTableEditorStore } from "@/store/tableEditor";
import { mergeProps } from "vue";

type SerializeFn = (dataSource: DataSource, item: ADataSourceItem<DataSourceType>) => Promise<Blob>;

const tableEditorStore = useTableEditorStore();
const { editedItem } = storeToRefs(tableEditorStore);
const exportFile = useExportFile();
const { dataSource } = useEditedItemDataSource();
</script>

<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <v-tooltip text="Export">
        <template #activator="{ props: tooltipProps }">
          <v-btn :disabled="!dataSource" :="mergeProps(menuProps, tooltipProps)">
            <v-icon icon="mdi-download" />
          </v-btn>
        </template>
      </v-tooltip>
    </template>
    <v-list>
      <v-list-item
        v-for="{ value, icon, title, create } of DataSourceTypeItemCategoryDefinitions"
        :key="value"
        @click="
          async () => {
            if (!dataSource || !editedItem) return;
            const configuration = DataSourceConfigurationMap[value];
            await exportFile(
              () => (configuration.serialize as SerializeFn)(dataSource, create()),
              editedItem.name,
              configuration.mimeType,
              configuration.accept,
            );
          }
        "
      >
        <v-icon :icon />
        {{ title }}
      </v-list-item>
    </v-list>
  </v-menu>
</template>
