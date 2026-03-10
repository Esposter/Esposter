<script setup lang="ts" generic="TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]">
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { DataSourceTypeItemCategoryDefinitions } from "@/services/tableEditor/file/DataSourceTypeItemCategoryDefinitions";
import { mergeProps } from "vue";

interface ExportButtonProps {
  editedItem: TDataSourceItem;
}

const { editedItem } = defineProps<ExportButtonProps>();
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
        v-for="{ value, icon, title, serializeDataSource } of DataSourceTypeItemCategoryDefinitions"
        :key="value"
        @click="
          async () => {
            if (!dataSource || !editedItem) return;
            const dataSourceValue = dataSource;
            const configuration = DataSourceConfigurationMap[value];
            await exportFile(
              () => serializeDataSource(dataSourceValue),
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
