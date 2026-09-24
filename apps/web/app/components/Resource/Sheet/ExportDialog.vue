<script setup lang="ts">
import type { DataSourceType } from "#shared/models/resource/sheet/datasource/DataSourceType";

import { UiButtonVariant } from "@/models/ui/UiButtonVariant";
import { UiDialogPlacement } from "@/models/ui/UiDialogPlacement";
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
const { cloned: selectedColumnIds } = useCloned(availableColumnIds);
</script>

<template>
  <UiDialog
    v-model="isOpen"
    :placement="UiDialogPlacement.Middle"
    :title="`Export as ${dataSourceType}`"
    w="[min(32rem,90vw)]"
  >
    <fieldset p-3 flex flex-col gap-2 min-h-0 of-y-auto>
      <legend text-muted mb-2>Columns to export</legend>
      <UiCheckbox
        v-for="{ id, name } of dataSource.columns"
        :key="id"
        is-label-shown
        :label="name"
        :model-value="selectedColumnIds.includes(id)"
        @update:model-value="
          selectedColumnIds = $event
            ? [...selectedColumnIds, id]
            : selectedColumnIds.filter((selectedColumnId) => selectedColumnId !== id)
        "
      />
    </fieldset>
    <footer p-3 flex gap-2 justify-end>
      <UiButton :variant="UiButtonVariant.Quiet" @click="isOpen = false">Cancel</UiButton>
      <UiButton
        :disabled="selectedColumnIds.length === 0"
        :variant="UiButtonVariant.Accent"
        @click="
          async () => {
            const configuration = DataSourceConfigurationMap[dataSourceType];
            // Exporting as another format falls back to that format's default settings (e.g. comma-delimited CSV)
            const exportSettings =
              settings.type === dataSourceType ? settings : createDefaultSheetSettings(dataSourceType);
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
            isOpen = false;
          }
        "
      >
        Export
      </UiButton>
    </footer>
  </UiDialog>
</template>
