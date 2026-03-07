import type { Column } from "#shared/models/tableEditor/file/Column";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { takeOne } from "@esposter/shared";

export const useFileTableEditorStore = defineStore("tableEditor/file", () => {
  const dataSource = ref<DataSource | null>(null);
  const setDataSource = (value: DataSource) => {
    dataSource.value = value;
  };
  const reset = () => {
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
  const updateColumn = (originalName: string, updated: Partial<Column>) => {
    if (!dataSource.value) return;
    const column = dataSource.value.columns.find((column) => column.name === originalName);
    if (!column) return;
    const newName = updated.name;
    if (newName !== undefined && newName !== originalName)
      dataSource.value.rows = dataSource.value.rows.map((row) => {
        const { [originalName]: value, ...rest } = row;
        return { ...rest, [newName]: value };
      });

    Object.assign(column, updated);
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
    updateColumn,
    updateRow,
  };
});
