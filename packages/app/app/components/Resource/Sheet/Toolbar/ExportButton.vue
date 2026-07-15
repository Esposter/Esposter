<script setup lang="ts">
import { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";
import { DataSourceTypeItemCategoryDefinitions } from "@/services/resource/sheet/dataSource/DataSourceTypeItemCategoryDefinitions";
import { useSheetStore } from "@/store/resource/sheet";

const sheetStore = useSheetStore();
const { dataSource } = storeToRefs(sheetStore);
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
  <ResourceSheetToolbarExportDialog v-model="isExportDialogOpen" :data-source-type />
</template>
