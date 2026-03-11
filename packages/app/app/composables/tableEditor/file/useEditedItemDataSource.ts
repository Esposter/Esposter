import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { Column } from "#shared/models/tableEditor/file/Column";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import type { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import type { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import type { ToData } from "@esposter/shared";

import { DeleteColumnCommand } from "@/models/tableEditor/file/commands/DeleteColumnCommand";
import { DeleteRowCommand } from "@/models/tableEditor/file/commands/DeleteRowCommand";
import { UpdateColumnCommand } from "@/models/tableEditor/file/commands/UpdateColumnCommand";
import { UpdateRowCommand } from "@/models/tableEditor/file/commands/UpdateRowCommand";
import { useTableEditorStore } from "@/store/tableEditor";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useEditedItemDataSource = () => {
  const tableEditorStore = useTableEditorStore<ADataSourceItem<DataSourceType>>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const dataSource = computed(() => editedItem.value?.dataSource ?? null);
  const dataSourceHistory = useDataSourceHistory();
  const { future, history, isRedoable, isUndoable, redoDescription, undoDescription } = dataSourceHistory;

  const executeAndRecord = (command: ADataSourceCommand) => {
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
    executeAndRecord(new DeleteRowCommand(index, originalRow));
  };

  const updateRow = (index: number, updatedRow: DataSource["rows"][number]) => {
    if (!editedItem.value?.dataSource || index === -1) return;
    const originalRow = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.rows, index)));
    executeAndRecord(new UpdateRowCommand(index, originalRow, updatedRow));
  };

  const updateColumn = (originalName: string, updatedColumn: ToData<Column | DateColumn>) => {
    if (!editedItem.value?.dataSource) return;
    const columnIndex = editedItem.value.dataSource.columns.findIndex(({ name }) => name === originalName);
    if (columnIndex === -1) return;
    const originalColumn = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.columns, columnIndex)));
    const originalRowValues = editedItem.value.dataSource.rows.map((row) => takeOne(toRawDeep(row), originalName));
    executeAndRecord(new UpdateColumnCommand(originalName, originalColumn, updatedColumn, originalRowValues));
  };

  const deleteColumn = (name: string) => {
    if (!editedItem.value?.dataSource) return;
    const columnIndex = editedItem.value.dataSource.columns.findIndex((column) => column.name === name);
    if (columnIndex === -1) return;
    const originalColumn = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.columns, columnIndex)));
    const originalRowValues = editedItem.value.dataSource.rows.map((row) => takeOne(toRawDeep(row), name));
    executeAndRecord(new DeleteColumnCommand(columnIndex, originalColumn, originalRowValues));
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
    redoDescription,
    setDataSource,
    undo,
    undoDescription,
    updateColumn,
    updateRow,
  };
};
