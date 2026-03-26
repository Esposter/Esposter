import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";
import type { AffectedCell } from "@/models/tableEditor/file/commands/AffectedCell";
import type { IndexedRow } from "@/models/tableEditor/file/commands/IndexedRow";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { NullStrategy } from "@/models/tableEditor/file/commands/NullStrategy";
import { getValueSize } from "@/services/tableEditor/file/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class NullStrategyCommand extends ADataSourceCommand<CommandType.NullStrategy> {
  readonly type = CommandType.NullStrategy;

  get description() {
    return `Null Strategy (${this.mode})`;
  }

  private readonly affectedCells: AffectedCell[];
  private readonly affectedRows: IndexedRow[];
  private readonly mode: NullStrategy;

  constructor(mode: NullStrategy, affectedCells: AffectedCell[], affectedRows: IndexedRow[]) {
    super();
    this.mode = mode;
    this.affectedCells = affectedCells;
    this.affectedRows = affectedRows;
  }

  protected doExecute(item: DataSourceItem) {
    if (!item.dataSource) return;
    if (this.mode === NullStrategy.ReplaceWithNA) {
      const columnsByNameMap = new Map(item.dataSource.columns.map((column) => [column.name, column]));
      for (const { columnName, rowIndex } of this.affectedCells) {
        const row = takeOne(item.dataSource.rows, rowIndex);
        const column = columnsByNameMap.get(columnName);
        if (!column) continue;
        column.size += getValueSize("N/A") - getValueSize(takeOne(row.data, columnName));
        row.data[columnName] = "N/A";
      }
    } else {
      const columnsByNameMap = new Map(item.dataSource.columns.map((column) => [column.name, column]));
      for (const { row } of this.affectedRows)
        for (const [columnName, value] of Object.entries(row.data)) {
          const column = columnsByNameMap.get(columnName);
          if (column) column.size -= getValueSize(value);
        }
      item.dataSource.rows = item.dataSource.rows.filter(
        ({ id }) => !this.affectedRows.some(({ row }) => row.id === id),
      );
    }
  }

  protected doUndo(item: DataSourceItem) {
    if (!item.dataSource) return;
    if (this.mode === NullStrategy.ReplaceWithNA) {
      const columnsByNameMap = new Map(item.dataSource.columns.map((column) => [column.name, column]));
      for (const { columnName, originalValue, rowIndex } of this.affectedCells) {
        const row = takeOne(item.dataSource.rows, rowIndex);
        const column = columnsByNameMap.get(columnName);
        if (!column) continue;
        column.size += getValueSize(originalValue) - getValueSize(takeOne(row.data, columnName));
        row.data[columnName] = originalValue;
      }
    } else {
      for (const { index, row } of this.affectedRows) item.dataSource.rows.splice(index, 0, row);
      const columnsByNameMap = new Map(item.dataSource.columns.map((column) => [column.name, column]));
      for (const { row } of this.affectedRows)
        for (const [columnName, value] of Object.entries(row.data)) {
          const column = columnsByNameMap.get(columnName);
          if (column) column.size += getValueSize(value);
        }
    }
  }
}
