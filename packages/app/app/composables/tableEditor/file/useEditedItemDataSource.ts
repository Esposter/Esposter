import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { Column } from "#shared/models/tableEditor/file/Column";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import type { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import type { DataSourceCommand } from "@/models/tableEditor/file/commands/DataSourceCommand";
import type { ToData } from "@esposter/shared";

import { createDeleteColumnCommand } from "@/services/tableEditor/file/commands/createDeleteColumnCommand";
import { createDeleteRowCommand } from "@/services/tableEditor/file/commands/createDeleteRowCommand";
import { createUpdateColumnCommand } from "@/services/tableEditor/file/commands/createUpdateColumnCommand";
import { createUpdateRowCommand } from "@/services/tableEditor/file/commands/createUpdateRowCommand";
import { withSyncStats } from "@/services/tableEditor/file/commands/withSyncStats";
import { useTableEditorStore } from "@/store/tableEditor";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useEditedItemDataSource = () => {
  const tableEditorStore = useTableEditorStore<ADataSourceItem<DataSourceType>>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const dataSource = computed(() => editedItem.value?.dataSource ?? null);
  const dataSourceHistory = useDataSourceHistory();
  const { future, history, isRedoable, isUndoable } = dataSourceHistory;

  const executeAndRecord = (command: DataSourceCommand) => {
    if (!editedItem.value) return;
    command.execute(editedItem.value);
    dataSourceHistory.push(command);
  };

  const setDataSource = (value: DataSource) => {
    if (!editedItem.value) return;
    editedItem.value.dataSource = value;
    dataSourceHistory.clear();
  };

  const deleteRow = (index: number) => {
    if (!editedItem.value?.dataSource) return;
    const originalRow = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.rows, index)));
    executeAndRecord(withSyncStats(createDeleteRowCommand(index, originalRow)));
  };

  const updateRow = (index: number, updatedRow: DataSource["rows"][number]) => {
    if (!editedItem.value?.dataSource || index === -1) return;
    const originalRow = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.rows, index)));
    executeAndRecord(withSyncStats(createUpdateRowCommand(index, originalRow, updatedRow)));
  };

  const updateColumn = (originalName: string, updatedColumn: ToData<Column | DateColumn>) => {
    if (!editedItem.value?.dataSource) return;
    const columnIndex = editedItem.value.dataSource.columns.findIndex(({ name }) => name === originalName);
    if (columnIndex === -1) return;
    const originalColumn = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.columns, columnIndex)));
    const originalRowValues = editedItem.value.dataSource.rows.map((row) => takeOne(toRawDeep(row), originalName));
    executeAndRecord(
      withSyncStats(createUpdateColumnCommand(originalName, originalColumn, updatedColumn, originalRowValues)),
    );
  };

  const deleteColumn = (name: string) => {
    if (!editedItem.value?.dataSource) return;
    const columnIndex = editedItem.value.dataSource.columns.findIndex((column) => column.name === name);
    if (columnIndex === -1) return;
    const originalColumn = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.columns, columnIndex)));
    const originalRowValues = editedItem.value.dataSource.rows.map((row) => takeOne(toRawDeep(row), name));
    executeAndRecord(withSyncStats(createDeleteColumnCommand(columnIndex, originalColumn, originalRowValues)));
  };

  const undo = () => {
    if (!editedItem.value || !isUndoable.value) return;
    const command = takeOne(history.value, history.value.length - 1);
    history.value.pop();
    future.value.push(command);
    command.undo(editedItem.value);
  };

  const redo = () => {
    if (!editedItem.value || !isRedoable.value) return;
    const command = takeOne(future.value, future.value.length - 1);
    future.value.pop();
    history.value.push(command);
    command.execute(editedItem.value);
  };

  watch(
    () => editedItem.value?.id,
    () => dataSourceHistory.clear(),
  );

  return {
    dataSource,
    deleteColumn,
    deleteRow,
    isRedoable,
    isUndoable,
    redo,
    setDataSource,
    undo,
    updateColumn,
    updateRow,
  };
};
