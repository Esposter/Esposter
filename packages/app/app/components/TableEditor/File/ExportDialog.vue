<script setup lang="ts" generic="TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]">
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { filterDataSourceColumns } from "@/services/tableEditor/file/filterDataSourceColumns";
import { useFileExportTableEditorStore } from "@/store/tableEditor/file/export";

interface ExportDialogProps {
  dataSourceType: DataSourceType;
  editedItem: TDataSourceItem;
}

const { dataSourceType, editedItem } = defineProps<ExportDialogProps>();
const isOpen = defineModel<boolean>();
const exportFile = useExportFile();
const { dataSource } = useEditedItemDataSource();
const fileExportTableEditorStore = useFileExportTableEditorStore();
const { selectedColumnIds } = storeToRefs(fileExportTableEditorStore);

watch(isOpen, (open) => {
  if (!open) return;
  const columnIds = dataSource.value?.columns.map(({ id }) => id) ?? [];
  const validColumnIds = selectedColumnIds.value.filter((id) => columnIds.includes(id));
  selectedColumnIds.value = validColumnIds.length > 0 ? validColumnIds : columnIds;
});
</script>

<template>
  <StyledDialog
    v-model="isOpen"
    :card-props="{ title: `Export as ${dataSourceType}` }"
    :confirm-button-props="{ text: 'Export' }"
    :confirm-button-attrs="{ disabled: selectedColumnIds.length === 0 }"
    @submit="
      async (_event, onComplete) => {
        if (!dataSource) return;
        const configuration = DataSourceConfigurationMap[dataSourceType];
        const filteredDataSource = filterDataSourceColumns(dataSource, selectedColumnIds);
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
    <v-container py-0 fluid>
      <v-checkbox
        v-for="{ id, name } of dataSource?.columns ?? []"
        :key="id"
        v-model="selectedColumnIds"
        :label="name"
        :value="id"
        density="compact"
        hide-details
      />
    </v-container>
  </StyledDialog>
</template>
