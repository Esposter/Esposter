import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/datasource/DataSourceItemTypeMap";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { takeOne } from "@esposter/shared";

export class DeleteColumnCommand extends ADataSourceCommand<CommandType.DeleteColumn> {
  readonly type = CommandType.DeleteColumn;

  get description() {
    return `Delete "${this.originalColumn.name}" Column`;
  }

  private readonly columnIndex: number;
  private readonly originalColumn: Column;
  private readonly originalRowValues: ColumnValue[];

  constructor(columnIndex: number, originalColumn: Column, originalRowValues: ColumnValue[]) {
    super();
    this.columnIndex = columnIndex;
    this.originalColumn = originalColumn;
    this.originalRowValues = originalRowValues;
  }

  protected doExecute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    item.dataSource.columns = item.dataSource.columns.filter((column) => column.name !== this.originalColumn.name);
    for (const row of item.dataSource.rows) delete row.data[this.originalColumn.name];
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    item.dataSource.columns = [
      ...item.dataSource.columns.slice(0, this.columnIndex),
      this.originalColumn,
      ...item.dataSource.columns.slice(this.columnIndex),
    ];
    const restoredColumnNames = item.dataSource.columns.map(({ name }) => name);
    for (const [index, row] of item.dataSource.rows.entries()) {
      row.data[this.originalColumn.name] = takeOne(this.originalRowValues, index);
      const newData: typeof row.data = {};
      for (const name of restoredColumnNames) newData[name] = takeOne(row.data, name);
      row.data = newData;
    }
  }
}
