<script setup lang="ts">
import type { DataSourceType } from "#shared/models/resource/file/datasource/DataSourceType";

import { createDefaultFileSettings } from "@/services/resource/file/createDefaultFileSettings";
import { DataSourceConfigurationMap } from "@/services/resource/file/dataSource/DataSourceConfigurationMap";
import { filterDataSourceColumns } from "@/services/resource/file/dataSource/filterDataSourceColumns";
import { filterDataSourceRows } from "@/services/resource/file/dataSource/filterDataSourceRows";
import { useFileStore } from "@/store/resource/file";
import { useFilterStore } from "@/store/resource/file/filter";
import { useRowStore } from "@/store/resource/file/row";

interface ExportDialogProps {
  dataSourceType: DataSourceType;
}

const isOpen = defineModel<boolean>({ default: false });
const { dataSourceType } = defineProps<ExportDialogProps>();
const exportFile = useExportFile();
const fileStore = useFileStore();
const { dataSource, resource, settings } = storeToRefs(fileStore);
const filterStore = useFilterStore();
const { columnFilters } = storeToRefs(filterStore);
const rowStore = useRowStore();
const { selectedRowIds } = storeToRefs(rowStore);
const availableColumnIds = computed(() => dataSource.value.columns.map(({ id }) => id));
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
        const configuration = DataSourceConfigurationMap[dataSourceType];
        // Exporting as another format falls back to that format's default settings (e.g. comma-delimited CSV)
        const exportSettings = settings.type === dataSourceType ? settings : createDefaultFileSettings(dataSourceType);
        const filteredRows = filterDataSourceRows(dataSource.rows, columnFilters);
        const exportRows =
          selectedRowIds.length > 0 ? filteredRows.filter((row) => selectedRowIds.includes(row.id)) : filteredRows;
        const { columns, rows } = filterDataSourceColumns(dataSource.columns, exportRows, displayedSelectedColumnIds);
        await exportFile(
          (mimeType) => configuration.serialize({ ...dataSource, columns, rows }, exportSettings, mimeType),
          resource?.name ?? 'export',
          configuration.mimeType,
          configuration.accept,
        );
        onComplete();
      }
    "
  >
    <div flex flex-col>
      <v-checkbox
        v-for="{ id, name } of dataSource.columns"
        :key="id"
        v-model="selectedColumnIds"
        density="compact"
        hide-details
        :label="name"
        :value="id"
      />
    </div>
  </StyledDialog>
</template>
