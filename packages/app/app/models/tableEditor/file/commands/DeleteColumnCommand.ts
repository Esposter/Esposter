import type { Column } from "#shared/models/tableEditor/file/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";
import type { DateColumn } from "#shared/models/tableEditor/file/DateColumn";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { takeOne } from "@esposter/shared";

export class DeleteColumnCommand extends ADataSourceCommand<CommandType.DeleteColumn> {
  readonly type = CommandType.DeleteColumn;

  get description() {
    return `Delete "${this.originalColumn.name}" Column`;
  }

  private readonly columnIndex: number;
  private readonly originalColumn: Column | DateColumn;
  private readonly originalRowValues: ColumnValue[];

  constructor(columnIndex: number, originalColumn: Column | DateColumn, originalRowValues: ColumnValue[]) {
    super();
    this.columnIndex = columnIndex;
    this.originalColumn = originalColumn;
    this.originalRowValues = originalRowValues;
  }

  protected doExecute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    item.dataSource.columns = item.dataSource.columns.filter((column) => column.name !== this.originalColumn.name);
    item.dataSource.rows = item.dataSource.rows.map((row) =>
      Object.fromEntries(Object.entries(row).filter(([key]) => key !== this.originalColumn.name)),
    );
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    item.dataSource.columns = [
      ...item.dataSource.columns.slice(0, this.columnIndex),
      this.originalColumn,
      ...item.dataSource.columns.slice(this.columnIndex),
    ];
    for (const [index, row] of item.dataSource.rows.entries())
      row[this.originalColumn.name] = takeOne(this.originalRowValues, index);
  }
}
