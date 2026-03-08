import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { Column } from "#shared/models/tableEditor/file/Column";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

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
  const deleteRow = (index: number) => {
    if (!editedItem.value?.dataSource) return;
    editedItem.value.dataSource.rows = editedItem.value.dataSource.rows.filter((_, rowIndex) => rowIndex !== index);
  };
  const updateRow = (index: number, updated: DataSource["rows"][number]) => {
    if (!editedItem.value?.dataSource || index === -1) return;
    Object.assign(takeOne(editedItem.value.dataSource.rows, index), updated);
  };
  const updateColumn = (originalName: string, updated: Partial<Column>) => {
    if (!editedItem.value?.dataSource) return;
    const column = editedItem.value.dataSource.columns.find((column) => column.name === originalName);
    if (!column) return;
    const newName = updated.name;
    if (newName !== undefined && newName !== originalName)
      editedItem.value.dataSource.rows = editedItem.value.dataSource.rows.map((row) =>
        Object.fromEntries(Object.entries(row).map(([key, val]) => [key === originalName ? newName : key, val])),
      );

    Object.assign(column, updated);
  };
  const deleteColumn = (name: string) => {
    if (!editedItem.value?.dataSource) return;
    editedItem.value.dataSource.columns = editedItem.value.dataSource.columns.filter((column) => column.name !== name);
    editedItem.value.dataSource.rows = editedItem.value.dataSource.rows.map((row) =>
      Object.fromEntries(Object.entries(row).filter(([key]) => key !== name)),
    );
  };
  return { dataSource, deleteColumn, deleteRow, setDataSource, updateColumn, updateRow };
};
