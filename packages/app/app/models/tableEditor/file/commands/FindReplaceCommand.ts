import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";
import type { AffectedCell } from "@/models/tableEditor/file/commands/AffectedCell";

import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { coerceValue } from "@/services/tableEditor/file/column/coerceValue";
import { getValueSize } from "@/services/tableEditor/file/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class FindReplaceCommand extends ADataSourceCommand<CommandType.FindReplace> {
  readonly type = CommandType.FindReplace;

  get description() {
    const uniqueRowIndices = new Set(this.affectedCells.map((cell) => cell.rowIndex));
    const location = uniqueRowIndices.size === 1 ? ` on row ${takeOne(this.affectedCells, 0).rowIndex + 1}` : " (all)";
    return `Find & Replace "${this.findValue}" → "${this.replaceValue}"${location}`;
  }

  private readonly affectedCells: AffectedCell[];
  private readonly findValue: string;
  private readonly replaceValue: string;

  constructor(findValue: string, replaceValue: string, affectedCells: AffectedCell[]) {
    super();
    this.findValue = findValue;
    this.replaceValue = replaceValue;
    this.affectedCells = affectedCells;
  }

  protected doExecute(item: DataSourceItem) {
    if (!item.dataSource) return;
    const columnsByNameMap = new Map(item.dataSource.columns.map((column) => [column.name, column]));
    for (const { columnName, originalValue, rowIndex } of this.affectedCells) {
      const row = takeOne(item.dataSource.rows, rowIndex);
      const column = columnsByNameMap.get(columnName);
      if (!column) continue;
      const replacedString = String(originalValue).replaceAll(this.findValue, this.replaceValue);
      const newValue = column.type === ColumnType.String ? replacedString : coerceValue(replacedString, column.type);
      column.size += getValueSize(newValue) - getValueSize(takeOne(row.data, columnName));
      row.data[columnName] = newValue;
    }
  }

  protected doUndo(item: DataSourceItem) {
    if (!item.dataSource) return;
    const columnsByNameMap = new Map(item.dataSource.columns.map((column) => [column.name, column]));
    for (const { columnName, originalValue, rowIndex } of this.affectedCells) {
      const row = takeOne(item.dataSource.rows, rowIndex);
      const column = columnsByNameMap.get(columnName);
      if (!column) continue;
      column.size += getValueSize(originalValue) - getValueSize(takeOne(row.data, columnName));
      row.data[columnName] = originalValue;
    }
  }
}
