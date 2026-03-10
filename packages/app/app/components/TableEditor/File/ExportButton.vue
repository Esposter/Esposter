<script setup lang="ts" generic="TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]">
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { DataSourceTypeItemCategoryDefinitions } from "@/services/tableEditor/file/DataSourceTypeItemCategoryDefinitions";
import { useTableEditorStore } from "@/store/tableEditor";
import { mergeProps } from "vue";

const tableEditorStore = useTableEditorStore<TDataSourceItem>();
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
            const dataSourceValue = dataSource;
            const configuration = DataSourceConfigurationMap[value];
            await exportFile(
              () => configuration.serialize(dataSourceValue, create()),
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
