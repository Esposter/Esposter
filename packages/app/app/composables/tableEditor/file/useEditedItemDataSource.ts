import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { Column } from "#shared/models/tableEditor/file/Column";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import type { DateColumn } from "#shared/models/tableEditor/file/DateColumn";

import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { dayjs } from "#shared/services/dayjs";
import { useTableEditorStore } from "@/store/tableEditor";
import { takeOne } from "@esposter/shared";

export const useEditedItemDataSource = () => {
  const tableEditorStore = useTableEditorStore<ADataSourceItem<DataSourceType>>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const dataSource = computed(() => editedItem.value?.dataSource ?? null);
  const setDataSource = (value: DataSource) => {
    if (!editedItem.value) return;
    editedItem.value.dataSource = value;
  };
  const getValueSize = (value: DataSource["rows"][number][string]): number =>
    JSON.stringify(value ?? null).length;
  const isDateColumn = (column: DataSource["columns"][number]): column is DateColumn =>
    column.type === ColumnType.Date;
  const syncStats = (dataSource: DataSource) => {
    dataSource.stats.columnCount = dataSource.columns.length;
    dataSource.stats.rowCount = dataSource.rows.length;
    dataSource.stats.size = dataSource.columns.reduce((total, column) => total + column.size, 0);
  };
  const deleteRow = (index: number) => {
    if (!editedItem.value?.dataSource) return;
    const row = takeOne(editedItem.value.dataSource.rows, index);
    for (const column of editedItem.value.dataSource.columns)
      column.size -= getValueSize(takeOne(row, column.name));
    editedItem.value.dataSource.rows = editedItem.value.dataSource.rows.filter((_, rowIndex) => rowIndex !== index);
    syncStats(editedItem.value.dataSource);
  };
  const updateRow = (index: number, updated: DataSource["rows"][number]) => {
    if (!editedItem.value?.dataSource || index === -1) return;
    const row = takeOne(editedItem.value.dataSource.rows, index);
    for (const column of editedItem.value.dataSource.columns)
      column.size += getValueSize(takeOne(updated, column.name)) - getValueSize(takeOne(row, column.name));
    Object.assign(row, updated);
    syncStats(editedItem.value.dataSource);
  };
  const updateColumn = (originalName: string, updated: Partial<Column & Pick<DateColumn, "format">>) => {
    if (!editedItem.value?.dataSource) return;
    const column = editedItem.value.dataSource.columns.find(({ name }) => name === originalName);
    if (!column) return;
    const newName = updated.name;
    if (newName !== undefined && newName !== originalName)
      editedItem.value.dataSource.rows = editedItem.value.dataSource.rows.map((row) =>
        Object.fromEntries(Object.entries(row).map(([key, val]) => [key === originalName ? newName : key, val])),
      );

    if (isDateColumn(column) && updated.format !== undefined && updated.format !== column.format) {
      const oldFormat = column.format;
      const newFormat = updated.format;
      const effectiveName = newName ?? originalName;
      editedItem.value.dataSource.rows = editedItem.value.dataSource.rows.map((row) => {
        const value = takeOne(row, effectiveName);
        if (typeof value !== "string") return row;
        const parsed = dayjs(value, oldFormat, true);
        if (!parsed.isValid()) return row;
        return { ...row, [effectiveName]: parsed.format(newFormat) };
      });
      column.size = editedItem.value.dataSource.rows.reduce(
        (total, row) => total + getValueSize(takeOne(row, effectiveName)),
        0,
      );
    }

    Object.assign(column, updated);
    syncStats(editedItem.value.dataSource);
  };
  const deleteColumn = (name: string) => {
    if (!editedItem.value?.dataSource) return;
    editedItem.value.dataSource.columns = editedItem.value.dataSource.columns.filter((column) => column.name !== name);
    editedItem.value.dataSource.rows = editedItem.value.dataSource.rows.map((row) =>
      Object.fromEntries(Object.entries(row).filter(([key]) => key !== name)),
    );
    syncStats(editedItem.value.dataSource);
  };
  return { dataSource, deleteColumn, deleteRow, setDataSource, updateColumn, updateRow };
};
