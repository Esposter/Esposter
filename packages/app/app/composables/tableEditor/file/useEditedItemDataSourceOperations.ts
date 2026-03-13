import type { Column } from "#shared/models/tableEditor/file/Column";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import type { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import type { ToData } from "@esposter/shared";

import { DeleteColumnCommand } from "@/models/tableEditor/file/commands/DeleteColumnCommand";
import { DeleteRowCommand } from "@/models/tableEditor/file/commands/DeleteRowCommand";
import { MoveColumnCommand } from "@/models/tableEditor/file/commands/MoveColumnCommand";
import { MoveRowCommand } from "@/models/tableEditor/file/commands/MoveRowCommand";
import { UpdateColumnCommand } from "@/models/tableEditor/file/commands/UpdateColumnCommand";
import { UpdateRowCommand } from "@/models/tableEditor/file/commands/UpdateRowCommand";
import { useTableEditorStore } from "@/store/tableEditor";
import { takeOne, toRawDeep } from "@esposter/shared";

export const useEditedItemDataSourceOperations = () => {
  const tableEditorStore = useTableEditorStore<DataSourceItemTypeMap[keyof DataSourceItemTypeMap]>();
  const { editedItem } = storeToRefs(tableEditorStore);
  const { clear, isRedoable, isUndoable, push, redo, redoDescription, undo, undoDescription } = useDataSourceHistory();

  const executeAndRecord = (command: ADataSourceCommand) => {
    if (!editedItem.value) return;
    command.execute(editedItem.value);
    push(command);
  };

  const setDataSource = (value: DataSource) => {
    if (!editedItem.value) return;
    editedItem.value.dataSource = value;
    clear();
  };

  const reorderColumns = (newColumns: (Column | DateColumn)[]) => {
    if (!editedItem.value?.dataSource) return;
    const oldColumns = editedItem.value.dataSource.columns;
    const movedColumn = newColumns.find((column, index) => column.id !== oldColumns[index]?.id);
    if (!movedColumn) return;
    const fromIndex = oldColumns.findIndex(({ id }) => id === movedColumn.id);
    const toIndex = newColumns.findIndex(({ id }) => id === movedColumn.id);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
    const toColumnName = oldColumns[toIndex]?.name ?? "";
    executeAndRecord(new MoveColumnCommand(fromIndex, toIndex, movedColumn.name, toColumnName));
  };

  const reorderRows = (newRows: DataSource["rows"]) => {
    if (!editedItem.value?.dataSource) return;
    const oldRows = editedItem.value.dataSource.rows;
    const movedRow = newRows.find((row, index) => row.id !== oldRows[index]?.id);
    if (!movedRow) return;
    const fromIndex = oldRows.findIndex(({ id }) => id === movedRow.id);
    const toIndex = newRows.findIndex(({ id }) => id === movedRow.id);
    if (fromIndex === -1 || toIndex === -1 || fromIndex === toIndex) return;
    executeAndRecord(new MoveRowCommand(fromIndex, toIndex));
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
    const originalRowValues = editedItem.value.dataSource.rows.map((row) => takeOne(toRawDeep(row).data, originalName));
    executeAndRecord(new UpdateColumnCommand(originalName, originalColumn, updatedColumn, originalRowValues));
  };

  const deleteColumn = (name: string) => {
    if (!editedItem.value?.dataSource) return;
    const columnIndex = editedItem.value.dataSource.columns.findIndex((column) => column.name === name);
    if (columnIndex === -1) return;
    const originalColumn = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.columns, columnIndex)));
    const originalRowValues = editedItem.value.dataSource.rows.map((row) => takeOne(toRawDeep(row).data, name));
    executeAndRecord(new DeleteColumnCommand(columnIndex, originalColumn, originalRowValues));
  };

  watch(
    () => editedItem.value?.id,
    () => clear(),
  );

  return {
    deleteColumn,
    deleteRow,
    isRedoable,
    isUndoable,
    redo: () => redo(editedItem.value),
    redoDescription,
    reorderColumns,
    reorderRows,
    setDataSource,
    undo: () => undo(editedItem.value),
    undoDescription,
    updateColumn,
    updateRow,
  };
};
