import type { Item } from "#shared/models/tableEditor/data/Item";
import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

import { DataSourceConfigurationMap } from "@/services/tableEditor/file/DataSourceConfigurationMap";
import { useTableEditorStore } from "@/store/tableEditor";

export const useFileTableEditorStore = defineStore("tableEditor/file", () => {
  const tableEditorStore = useTableEditorStore();
  const dataSource = ref<DataSource | null>(null);
  const currentDataSourceItem = ref<ADataSourceItem<DataSourceType> | null>(null);
  const importFile = async (file: File, item: ADataSourceItem<DataSourceType>) => {
    const dataSourceConfiguration = DataSourceConfigurationMap[item.type];
    const result = await dataSourceConfiguration.parse(file, item);
    item.name = result.metadata.name;
    currentDataSourceItem.value = item;
    dataSource.value = result;
  };
  const saveItem = () => {
    const item = currentDataSourceItem.value;
    if (!item) return;
    tableEditorStore.createItem(item as Item);
  };
  const deleteRow = (index: number) => {
    if (!dataSource.value) return;
    dataSource.value = { ...dataSource.value, rows: dataSource.value.rows.filter((_, rowIndex) => rowIndex !== index) };
  };
  const updateRow = (index: number, updated: DataSource["rows"][number]) => {
    if (!dataSource.value) return;
    const rows = [...dataSource.value.rows];
    rows[index] = updated;
    dataSource.value = { ...dataSource.value, rows };
  };
  const setDataSource = (value: DataSource) => {
    dataSource.value = value;
  };
  const reset = () => {
    dataSource.value = null;
    currentDataSourceItem.value = null;
  };
  const deleteColumn = (name: string) => {
    if (!dataSource.value) return;
    const columns = dataSource.value.columns.filter((column) => column.name !== name);
    const rows = dataSource.value.rows.map((row) => {
      const { [name]: _, ...rest } = row;
      return rest;
    });
    dataSource.value = { ...dataSource.value, columns, rows };
  };
  return {
    currentDataSourceItem,
    dataSource,
    deleteColumn,
    deleteRow,
    importFile,
    reset,
    saveItem,
    setDataSource,
    updateRow,
  };
});
