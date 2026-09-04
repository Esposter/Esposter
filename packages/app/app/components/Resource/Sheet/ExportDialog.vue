<script setup lang="ts">
import type { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";

import { createDefaultSheetSettings } from "@/services/resource/sheet/createDefaultSheetSettings";
import { DataSourceConfigurationMap } from "@/services/resource/sheet/dataSource/DataSourceConfigurationMap";
import { filterDataSourceColumns } from "@/services/resource/sheet/dataSource/filterDataSourceColumns";
import { filterDataSourceRows } from "@/services/resource/sheet/dataSource/filterDataSourceRows";
import { useResourceStore } from "@/store/resource";
import { useSheetStore } from "@/store/resource/sheet";
import { useFilterStore } from "@/store/resource/sheet/filter";
import { useRowStore } from "@/store/resource/sheet/row";

interface Props {
  dataSourceType: DataSourceType;
}

const isOpen = defineModel<boolean>({ default: false });
const { dataSourceType } = defineProps<Props>();
const exportFile = useExportFile();
const resourceStore = useResourceStore();
const { resource } = storeToRefs(resourceStore);
const sheetStore = useSheetStore();
const { dataSource, settings } = storeToRefs(sheetStore);
const filterStore = useFilterStore();
const { columnFilters } = storeToRefs(filterStore);
const rowStore = useRowStore();
const { selectedRowIds } = storeToRefs(rowStore);
const availableColumnIds = computed(() => dataSource.value.columns.map(({ id }) => id));
// Every column ships unless the reader unticks one, so the boxes start ticked and follow the sheet's own columns.
// The empty selection used to mean "all of them", which read as the opposite on screen: nothing was ticked while
// Everything was going out, and the first tick looked like it added a column rather than dropping the other ten
const { cloned: selectedColumnIds } = useCloned(availableColumnIds);
</script>

<template>
  <StyledDialog
    v-model="isOpen"
    :card-props="{ title: `Export as ${dataSourceType}` }"
    :confirm-button-props="{ text: 'Export' }"
    :confirm-button-attrs="{ disabled: selectedColumnIds.length === 0 }"
    @confirm="
      async (onComplete) => {
        const configuration = DataSourceConfigurationMap[dataSourceType];
        // Exporting as another format falls back to that format's default settings (e.g. comma-delimited CSV)
        const exportSettings = settings.type === dataSourceType ? settings : createDefaultSheetSettings(dataSourceType);
        const filteredRows = filterDataSourceRows(dataSource.rows, columnFilters);
        const exportRows =
          selectedRowIds.length > 0 ? filteredRows.filter((row) => selectedRowIds.includes(row.id)) : filteredRows;
        const { columns, rows } = filterDataSourceColumns(dataSource.columns, exportRows, selectedColumnIds);
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
        :label="name"
        :value="id"
      />
    </div>
  </StyledDialog>
</template>
