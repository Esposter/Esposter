<script setup lang="ts" generic="TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]">
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { filterDataSourceColumns } from "@/services/tableEditor/file/filterDataSourceColumns";

interface ExportDialogProps {
  dataSourceType: DataSourceType;
  editedItem: TDataSourceItem;
}

const { dataSourceType, editedItem } = defineProps<ExportDialogProps>();
const isOpen = defineModel<boolean>();
const exportFile = useExportFile();
const { dataSource } = useEditedItemDataSource();
const columnNames = computed(() => dataSource.value?.columns.map((column) => column.name) ?? []);
const selectedColumnNames = ref<string[]>([]);

watch(isOpen, (open) => {
  if (open) selectedColumnNames.value = columnNames.value;
});
</script>

<template>
  <StyledDialog
    v-model="isOpen"
    :card-props="{ title: `Export as ${dataSourceType}` }"
    :confirm-button-props="{ text: 'Export' }"
    :confirm-button-attrs="{ disabled: selectedColumnNames.length === 0 }"
    @submit="
      async (_event, onComplete) => {
        if (!dataSource) return;
        const configuration = DataSourceConfigurationMap[dataSourceType];
        const filteredDataSource = filterDataSourceColumns(dataSource, selectedColumnNames);
        await exportFile(
          (mimeType) => configuration.serialize(filteredDataSource, editedItem, mimeType),
          editedItem.name,
          configuration.mimeType,
          configuration.accept,
        );
        onComplete();
      }
    "
  >
    <v-container fluid>
      <v-autocomplete
        v-model="selectedColumnNames"
        :items="columnNames"
        label="Columns"
        multiple
        chips
        closable-chips
      />
    </v-container>
  </StyledDialog>
</template>
