<script setup lang="ts" generic="TDataSourceItem extends DataSourceItem">
import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";
import type { DataSourceType } from "#shared/models/tableEditor/file/datasource/DataSourceType";

import { DataSourceConfigurationMap } from "@/services/tableEditor/file/dataSource/DataSourceConfigurationMap";
import { filterDataSourceColumns } from "@/services/tableEditor/file/dataSource/filterDataSourceColumns";
import { filterDataSourceRows } from "@/services/tableEditor/file/dataSource/filterDataSourceRows";
import { useFilterStore } from "@/store/tableEditor/file/filter";
import { useRowStore } from "@/store/tableEditor/file/row";

interface ExportDialogProps {
  dataSourceType: DataSourceType;
  editedItem: TDataSourceItem;
}

const isOpen = defineModel<boolean>({ default: false });
const { dataSourceType, editedItem } = defineProps<ExportDialogProps>();
const exportFile = useExportFile();
const filterStore = useFilterStore();
const { columnFilters } = storeToRefs(filterStore);
const rowStore = useRowStore();
const { selectedRowIds } = storeToRefs(rowStore);
const availableColumnIds = computed(() => editedItem.dataSource?.columns.map(({ id }) => id) ?? []);
const selectedColumnIds = ref<string[]>([]);
const displayedSelectedColumnIds = computed(() => {
  const displayedSelectedColumnIds = selectedColumnIds.value.filter((id) => availableColumnIds.value.includes(id));
  return displayedSelectedColumnIds.length > 0 ? displayedSelectedColumnIds : availableColumnIds.value;
});
</script>

<template>
  <StyledDialog
    v-model="isOpen"
    :card-props="{ title: `Export as ${dataSourceType}` }"
    :confirm-button-props="{ text: 'Export' }"
    :confirm-button-attrs="{ disabled: displayedSelectedColumnIds.length === 0 }"
    @confirm="
      async (onComplete) => {
        if (!editedItem.dataSource) {
          onComplete();
          return;
        }

        const { dataSource } = editedItem;
        const configuration = DataSourceConfigurationMap[dataSourceType];
        const filteredRows = filterDataSourceRows(dataSource.rows, columnFilters);
        const exportRows =
          selectedRowIds.length > 0 ? filteredRows.filter((row) => selectedRowIds.includes(row.id)) : filteredRows;
        const { columns, rows } = filterDataSourceColumns(dataSource.columns, exportRows, displayedSelectedColumnIds);
        await exportFile(
          (mimeType) => configuration.serialize({ ...dataSource, columns, rows }, editedItem, mimeType),
          editedItem.name,
          configuration.mimeType,
          configuration.accept,
        );
        onComplete();
      }
    "
  >
    <v-container fluid py-0>
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
