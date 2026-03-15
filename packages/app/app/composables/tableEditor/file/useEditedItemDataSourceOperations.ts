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
import { DeleteRowCommand } from "@/models/tableEditor/file/commands/DeleteRowCommand";
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

  const createRow = (row?: Row) => {
    if (!editedItem.value?.dataSource) return;
    const newRow =
      row ??
      new Row({
        data: Object.fromEntries(editedItem.value.dataSource.columns.map((column) => [column.name, null])),
      });
    const index = editedItem.value.dataSource.rows.length;
    executeAndRecord(new CreateRowCommand(index, newRow));
  };

  const deleteRow = (id: string) => {
    if (!editedItem.value?.dataSource) return;
    const index = editedItem.value.dataSource.rows.findIndex((row) => row.id === id);
    if (index === -1) return;
    const originalRow = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.rows, index)));
    executeAndRecord(new DeleteRowCommand(index, originalRow));
  };

  const updateRow = (id: string, updatedRow: DataSource["rows"][number]) => {
    if (!editedItem.value?.dataSource) return;
    const index = editedItem.value.dataSource.rows.findIndex((row) => row.id === id);
    if (index === -1) return;
    const originalRow = structuredClone(toRawDeep(takeOne(editedItem.value.dataSource.rows, index)));
    executeAndRecord(new UpdateRowCommand(index, originalRow, structuredClone(toRawDeep(updatedRow))));
  };

  const updateColumn = (originalName: string, updatedColumn: ToData<Column | DateColumn>) => {
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

  const createColumn = (formData: ToData<Column | DateColumn>) => {
    if (!editedItem.value?.dataSource) return;
    const newColumn =
      formData.type === ColumnType.Date
        ? new DateColumn(formData as Partial<DateColumn>)
        : new Column(formData as Partial<Column>);
    const columnIndex = editedItem.value.dataSource.columns.length;
    executeAndRecord(new CreateColumnCommand(columnIndex, newColumn));
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
    createColumn,
    createRow,
    deleteColumn,
    deleteRow,
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
