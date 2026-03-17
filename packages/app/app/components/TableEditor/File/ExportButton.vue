<script setup lang="ts" generic="TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]">
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { DataSourceTypeItemCategoryDefinitions } from "@/services/tableEditor/file/dataSource/DataSourceTypeItemCategoryDefinitions";
import { mergeProps } from "vue";

interface ExportButtonProps {
  editedItem: TDataSourceItem;
}

const { editedItem } = defineProps<ExportButtonProps>();
const isExportDialogOpen = ref(false);
const dataSourceType = ref(DataSourceType.Csv);
</script>

<template>
  <v-menu>
    <template #activator="{ props: menuProps }">
      <v-tooltip text="Export">
        <template #activator="{ props: tooltipProps }">
          <v-btn icon="mdi-download" :disabled="!editedItem.dataSource" :="mergeProps(menuProps, tooltipProps)" />
        </template>
      </v-tooltip>
    </template>
    <v-list>
      <v-list-item
        v-for="{ value, icon, title } of DataSourceTypeItemCategoryDefinitions"
        :key="value"
        @click="
          () => {
            dataSourceType = value;
            isExportDialogOpen = true;
          }
        "
      >
        <v-icon :icon />
        {{ title }}
      </v-list-item>
    </v-list>
  </v-menu>
  <TableEditorFileExportDialog v-model="isExportDialogOpen" :edited-item :data-source-type />
</template>
