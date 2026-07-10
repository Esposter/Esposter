<script setup lang="ts">
import { DataSourceType } from "#shared/models/resource/file/datasource/DataSourceType";
import { DataSourceTypeItemCategoryDefinitions } from "@/services/resource/file/dataSource/DataSourceTypeItemCategoryDefinitions";
import { useFileStore } from "@/store/resource/file";

const fileStore = useFileStore();
const { dataSource } = storeToRefs(fileStore);
const isExportDialogOpen = ref(false);
const dataSourceType = ref(DataSourceType.Csv);
</script>

<template>
  <StyledTooltipMenuIconButton
    :button-props="{ disabled: dataSource.rows.length === 0 }"
    icon="mdi-download"
    text="Export"
  >
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
  <ResourceFileToolbarExportDialog v-model="isExportDialogOpen" :data-source-type />
</template>
