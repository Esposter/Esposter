<script setup lang="ts" generic="TDataSourceItem extends DataSourceItemTypeMap[keyof DataSourceItemTypeMap]">
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/datasource/DataSourceItemTypeMap";
import type { DataSourceType } from "#shared/models/tableEditor/file/datasource/DataSourceType";

import { DataSourceConfigurationMap } from "@/services/tableEditor/file/dataSource/DataSourceConfigurationMap";
import { filterDataSourceColumns } from "@/services/tableEditor/file/dataSource/filterDataSourceColumns";
import { filterDataSourceRows } from "@/services/tableEditor/file/dataSource/filterDataSourceRows";
import { useFilterStore } from "@/store/tableEditor/file/filter";

interface ExportDialogProps {
  dataSourceType: DataSourceType;
  editedItem: TDataSourceItem;
}

const isOpen = defineModel<boolean>({ default: false });
const { dataSourceType, editedItem } = defineProps<ExportDialogProps>();
const exportFile = useExportFile();
const filterStore = useFilterStore();
const selectedColumnIds = ref<string[]>([]);

watchImmediate(
  () => editedItem.dataSource?.columns.map(({ id }) => id) ?? [],
  (newColumnIds) => {
    const validColumnIds = selectedColumnIds.value.filter((id) => newColumnIds.includes(id));
    selectedColumnIds.value = validColumnIds.length > 0 ? validColumnIds : newColumnIds;
  },
);
</script>

<template>
  <StyledDialog
    v-model="isOpen"
    :card-props="{ title: `Export as ${dataSourceType}` }"
    :confirm-button-props="{ text: 'Export' }"
    :confirm-button-attrs="{ disabled: selectedColumnIds.length === 0 }"
    @confirm="
      async (onComplete) => {
        if (!editedItem.dataSource) {
          onComplete();
          return;
        }

        const configuration = DataSourceConfigurationMap[dataSourceType];
        const filteredByRows = filterDataSourceRows(editedItem.dataSource, filterStore.columnFilters);
        const filteredDataSource = filterDataSourceColumns(filteredByRows, selectedColumnIds);
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
        v-for="{ id, name } of editedItem.dataSource?.columns ?? []"
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
