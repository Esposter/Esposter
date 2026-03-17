import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { AffectedCell } from "@/models/tableEditor/file/commands/AffectedCell";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { NormalizeStringMode } from "@/models/tableEditor/file/NormalizeStringMode";
import { applyNormalizeStringMode } from "@/services/tableEditor/file/applyNormalizeStringMode";
import { getValueSize } from "@/services/tableEditor/file/getValueSize";
import { takeOne } from "@esposter/shared";

export class NormalizeStringsCommand extends ADataSourceCommand<CommandType.NormalizeStrings> {
  readonly type = CommandType.NormalizeStrings;

  get description() {
    return `Normalize Strings (${this.mode})`;
  }

  private readonly affectedCells: AffectedCell[];
  private readonly mode: NormalizeStringMode;

  constructor(mode: NormalizeStringMode, affectedCells: AffectedCell[]) {
    super();
    this.mode = mode;
    this.affectedCells = affectedCells;
  }

  protected doExecute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const columnsByNameMap = new Map(item.dataSource.columns.map((column) => [column.name, column]));
    for (const { columnName, originalValue, rowIndex } of this.affectedCells) {
      const row = takeOne(item.dataSource.rows, rowIndex);
      const column = columnsByNameMap.get(columnName);
      if (!column) continue;
      const newValue = applyNormalizeStringMode(String(originalValue), this.mode);
      column.size += getValueSize(newValue) - getValueSize(takeOne(row.data, columnName));
      row.data[columnName] = newValue;
    }
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
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
