import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { useTableEditorStore } from "@/store/tableEditor";
import { takeOne } from "@esposter/shared";

export const useFileTableEditorStore = defineStore("tableEditor/file", () => {
  const tableEditorStore = useTableEditorStore();
  const dataSource = ref<DataSource | null>(null);
  const setDataSource = (value: DataSource) => {
    dataSource.value = value;
  };
  const reset = async () => {
    await tableEditorStore.resetItem();
    dataSource.value = null;
  };
  const deleteRow = (index: number) => {
    if (!dataSource.value) return;
    dataSource.value.rows = dataSource.value.rows.filter((_, rowIndex) => rowIndex !== index);
  };
  const updateRow = (index: number, updated: DataSource["rows"][number]) => {
    if (!dataSource.value || index === -1) return;
    Object.assign(takeOne(dataSource.value.rows, index), updated);
  };
  const deleteColumn = (name: string) => {
    if (!dataSource.value) return;
    dataSource.value.columns = dataSource.value.columns.filter((column) => column.name !== name);
    dataSource.value.rows = dataSource.value.rows.map((row) => {
      const { [name]: _, ...rest } = row;
      return rest;
    });
  };
  return {
    dataSource,
    deleteColumn,
    deleteRow,
    reset,
    setDataSource,
    updateRow,
  };
});
