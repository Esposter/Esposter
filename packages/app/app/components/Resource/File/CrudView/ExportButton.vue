<script setup lang="ts" generic="TDataSourceItem extends DataSourceItem">
import type { DataSourceItem } from "#shared/models/resource/file/datasource/DataSourceItem";

import { DataSourceType } from "#shared/models/resource/file/datasource/DataSourceType";
import { DataSourceTypeItemCategoryDefinitions } from "@/services/resource/file/dataSource/DataSourceTypeItemCategoryDefinitions";

interface ExportButtonProps {
  editedItem: TDataSourceItem;
}

const { editedItem } = defineProps<ExportButtonProps>();
const isExportDialogOpen = ref(false);
const dataSourceType = ref(DataSourceType.Csv);
</script>

<template>
  <StyledTooltipMenuIconButton :button-props="{ disabled: !editedItem.dataSource }" icon="mdi-download" text="Export">
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
  </StyledTooltipMenuIconButton>
  <ResourceFileCrudViewExportDialog v-model="isExportDialogOpen" :edited-item :data-source-type />
</template>
