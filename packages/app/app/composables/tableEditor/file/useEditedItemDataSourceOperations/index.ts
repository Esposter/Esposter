import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import type { ToData } from "@esposter/shared";

import { Column } from "#shared/models/tableEditor/file/Column";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import { Row } from "#shared/models/tableEditor/file/Row";
import { CreateColumnCommand } from "@/models/tableEditor/file/commands/CreateColumnCommand";
import { CreateRowCommand } from "@/models/tableEditor/file/commands/CreateRowCommand";
import { DeleteColumnCommand } from "@/models/tableEditor/file/commands/DeleteColumnCommand";
import { DeleteColumnsCommand } from "@/models/tableEditor/file/commands/DeleteColumnsCommand";
import { DeleteRowCommand } from "@/models/tableEditor/file/commands/DeleteRowCommand";
import { DeleteRowsCommand } from "@/models/tableEditor/file/commands/DeleteRowsCommand";
import { MoveColumnCommand } from "@/models/tableEditor/file/commands/MoveColumnCommand";
import { MoveRowCommand } from "@/models/tableEditor/file/commands/MoveRowCommand";
import { ToggleColumnVisibilityCommand } from "@/models/tableEditor/file/commands/ToggleColumnVisibilityCommand";
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

  const reorderColumns = (newColumns: DataSource["columns"]) => {
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

  const createRow = (newRow?: Row) => {
    if (!editedItem.value?.dataSource) return;
    const createdRow = new Row({
      data:
        newRow?.data ?? Object.fromEntries(editedItem.value.dataSource.columns.map((column) => [column.name, null])),
    });
    const index = editedItem.value.dataSource.rows.length;
    executeAndRecord(new CreateRowCommand(index, createdRow));
  };

  const deleteRow = (id: string) => {
    if (!editedItem.value?.dataSource) return;
    const index = editedItem.value.dataSource.rows.findIndex((row) => row.id === id);
    if (index === -1) return;
    const originalRow = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.rows, index)));
    executeAndRecord(new DeleteRowCommand(index, originalRow));
  };

  const deleteRows = (ids: string[]) => {
    const dataSource = editedItem.value?.dataSource;
    if (!dataSource) return;
    const indexedRows: { index: number; row: DataSource["rows"][number] }[] = [];
    for (const id of ids) {
      const index = dataSource.rows.findIndex((row) => row.id === id);
      if (index === -1) continue;
      indexedRows.push({ index, row: structuredClone(toRawDeep(takeOne(dataSource.rows, index))) });
    }
    if (indexedRows.length === 0) return;
    executeAndRecord(new DeleteRowsCommand(indexedRows));
  };

  const updateRow = (updatedRow: Row) => {
    if (!editedItem.value?.dataSource) return;
    const index = editedItem.value.dataSource.rows.findIndex((row) => row.id === updatedRow.id);
    if (index === -1) return;
    const originalRow = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.rows, index)));
    executeAndRecord(new UpdateRowCommand(index, originalRow, structuredClone(toRawDeep(updatedRow))));
  };

  const updateColumn = (originalName: string, updatedColumn: ToData<DataSource["columns"][number]>) => {
    if (!editedItem.value?.dataSource) return;
    const columnIndex = editedItem.value.dataSource.columns.findIndex(({ name }) => name === originalName);
    if (columnIndex === -1) return;
    const originalColumn = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.columns, columnIndex)));
    const originalRowValues = editedItem.value.dataSource.rows.map((row) => takeOne(toRawDeep(row).data, originalName));
    executeAndRecord(
      new UpdateColumnCommand(
        originalName,
        originalColumn,
        structuredClone(toRawDeep(updatedColumn)),
        originalRowValues,
      ),
    );
  };

  const toggleColumnVisibility = (id: string) => {
    if (!editedItem.value?.dataSource) return;
    const column = editedItem.value.dataSource.columns.find((column) => column.id === id);
    if (!column) return;
    executeAndRecord(new ToggleColumnVisibilityCommand(id, column.name, column.hidden));
  };

  const createColumn = (newColumn: DataSource["columns"][number]) => {
    if (!editedItem.value?.dataSource) return;
    const { id: _id, ...newColumnWithoutId } = newColumn;
    const createdColumn =
      newColumnWithoutId.type === ColumnType.Date
        ? new DateColumn(newColumnWithoutId)
        : (new Column(newColumnWithoutId) as DataSource["columns"][number]);
    const columnIndex = editedItem.value.dataSource.columns.length;
    executeAndRecord(new CreateColumnCommand(columnIndex, createdColumn));
  };

  const deleteColumn = (name: string) => {
    if (!editedItem.value?.dataSource) return;
    const columnIndex = editedItem.value.dataSource.columns.findIndex((column) => column.name === name);
    if (columnIndex === -1) return;
    const originalColumn = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.columns, columnIndex)));
    const originalRowValues = editedItem.value.dataSource.rows.map((row) => takeOne(toRawDeep(row).data, name));
    executeAndRecord(new DeleteColumnCommand(columnIndex, originalColumn, originalRowValues));
  };

  const deleteColumns = (ids: string[]) => {
    const dataSource = editedItem.value?.dataSource;
    if (!dataSource) return;
    const indexedColumns: { columnIndex: number; originalColumn: DataSource["columns"][number]; originalRowValues: ColumnValue[] }[] = [];
    for (const id of ids) {
      const columnIndex = dataSource.columns.findIndex((column) => column.id === id);
      if (columnIndex === -1) continue;
      const originalColumn = structuredClone(toRawDeep(takeOne(dataSource.columns, columnIndex)));
      const originalRowValues = dataSource.rows.map((row) => takeOne(toRawDeep(row).data, originalColumn.name));
      indexedColumns.push({ columnIndex, originalColumn, originalRowValues });
    }
    if (indexedColumns.length === 0) return;
    executeAndRecord(new DeleteColumnsCommand(indexedColumns));
  };

  watch(
    () => editedItem.value?.id,
    () => clear(),
  );

  return {
    createColumn,
    createRow,
    deleteColumn,
    deleteColumns,
    deleteRow,
    deleteRows,
    isRedoable,
    isUndoable,
    redo: () => redo(editedItem.value),
    redoDescription,
    reorderColumns,
    reorderRows,
    setDataSource,
    toggleColumnVisibility,
    undo: () => undo(editedItem.value),
    undoDescription,
    updateColumn,
    updateRow,
  };
};
