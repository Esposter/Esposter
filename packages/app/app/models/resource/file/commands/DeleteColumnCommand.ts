import type { Column } from "#shared/models/resource/file/column/Column";
import type { ColumnValue } from "#shared/models/resource/file/column/ColumnValue";
import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";

import { ADataSourceCommand } from "@/models/resource/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/file/commands/CommandType";
import { takeOne } from "@esposter/shared";

export class DeleteColumnCommand extends ADataSourceCommand<CommandType.DeleteColumn> {
  readonly type = CommandType.DeleteColumn;

  get description() {
    return `Delete "${this.#originalColumn.name}" Column`;
  }

  readonly #columnIndex: number;
  readonly #originalColumn: Column;
  readonly #originalRowValues: ColumnValue[];

  constructor(columnIndex: number, originalColumn: Column, originalRowValues: ColumnValue[]) {
    super();
    this.#columnIndex = columnIndex;
    this.#originalColumn = originalColumn;
    this.#originalRowValues = originalRowValues;
  }

  protected doExecute(dataSource: DataSource) {
    dataSource.columns = dataSource.columns.filter((column) => column.name !== this.#originalColumn.name);
    for (const { data } of dataSource.rows) delete data[this.#originalColumn.name];
  }

  protected doUndo(dataSource: DataSource) {
    dataSource.columns = [
      ...dataSource.columns.slice(0, this.#columnIndex),
      this.#originalColumn,
      ...dataSource.columns.slice(this.#columnIndex),
    ];
    const restoredColumnNames = dataSource.columns.map(({ name }) => name);
    for (const [index, row] of dataSource.rows.entries()) {
      row.data[this.#originalColumn.name] = takeOne(this.#originalRowValues, index);
      const newData: typeof row.data = {};
      for (const name of restoredColumnNames) newData[name] = takeOne(row.data, name);
      row.data = newData;
    }
  }
}
