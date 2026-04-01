import type { Column } from "#shared/models/tableEditor/file/column/Column";
import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

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

  protected doExecute(item: DataSourceItem) {
    if (!item.dataSource) return;
    item.dataSource.columns = item.dataSource.columns.filter((column) => column.name !== this.originalColumn.name);
    for (const column of item.dataSource.columns) if (column.order > this.columnIndex) column.order--;
    for (const row of item.dataSource.rows) delete row.data[this.originalColumn.name];
  }

  protected doUndo(item: DataSourceItem) {
    if (!item.dataSource) return;
    for (const column of item.dataSource.columns) if (column.order >= this.columnIndex) column.order++;
    this.originalColumn.order = this.columnIndex;
    item.dataSource.columns.push(this.originalColumn);
    const sortedColumnNames = item.dataSource.columns.toSorted((a, b) => a.order - b.order).map(({ name }) => name);
    for (const [index, row] of item.dataSource.rows.entries()) {
      row.data[this.originalColumn.name] = takeOne(this.originalRowValues, index);
      const newData: typeof row.data = {};
      for (const name of sortedColumnNames) newData[name] = takeOne(row.data, name);
      row.data = newData;
    }
  }
}
