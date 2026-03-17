import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { getValueSize } from "@/services/tableEditor/file/getValueSize";
import { takeOne } from "@esposter/shared";

export interface AffectedCell {
  columnName: string;
  originalValue: ColumnValue;
  rowIndex: number;
}

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

  protected doExecute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    for (const { columnName, originalValue, rowIndex } of this.affectedCells) {
      const row = takeOne(item.dataSource.rows, rowIndex);
      const column = item.dataSource.columns.find((column) => column.name === columnName);
      if (!column) continue;
      const newValue = String(originalValue).replaceAll(this.findValue, this.replaceValue);
      column.size += getValueSize(newValue) - getValueSize(takeOne(row.data, columnName));
      row.data[columnName] = newValue;
    }
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    for (const { columnName, originalValue, rowIndex } of this.affectedCells) {
      const row = takeOne(item.dataSource.rows, rowIndex);
      const column = item.dataSource.columns.find((column) => column.name === columnName);
      if (!column) continue;
      column.size += getValueSize(originalValue) - getValueSize(takeOne(row.data, columnName));
      row.data[columnName] = originalValue;
    }
  }
}
