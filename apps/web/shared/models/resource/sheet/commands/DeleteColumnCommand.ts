import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { ColumnValue } from "#shared/models/resource/sheet/column/ColumnValue";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { ADataSourceCommand } from "#shared/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "#shared/models/resource/sheet/commands/CommandType";
import { alignRowDataToColumns } from "#shared/services/resource/sheet/commands/alignRowDataToColumns";
import { getOriginalRowValues } from "#shared/services/resource/sheet/commands/getOriginalRowValues";
import { takeOne, toRawDeep } from "@esposter/shared";

export class DeleteColumnCommand extends ADataSourceCommand<CommandType.DeleteColumn> {
  readonly type = CommandType.DeleteColumn;

  get description() {
    return `Delete "${this.#name}" Column`;
  }

  // What the column held before this command, recorded from the document on execute, as UpdateColumnCommand records
  #columnIndex = 0;
  #originalColumn: Column | undefined;
  #originalRowValues: ColumnValue[] = [];
  readonly #name: string;

  constructor(name: string) {
    super();
    this.#name = name;
  }

  execute(dataSource: DataSource) {
    const columnIndex = dataSource.columns.findIndex((column) => column.name === this.#name);
    if (columnIndex === -1) return;
    this.#columnIndex = columnIndex;
    this.#originalColumn = structuredClone(toRawDeep(takeOne(dataSource.columns, columnIndex)));
    this.#originalRowValues = getOriginalRowValues(dataSource, this.#name);
    dataSource.columns = dataSource.columns.filter((column) => column.name !== this.#name);
    for (const { data } of dataSource.rows) delete data[this.#name];
  }

  undo(dataSource: DataSource) {
    const originalColumn = this.#originalColumn;
    if (originalColumn === undefined) return;
    dataSource.columns = [
      ...dataSource.columns.slice(0, this.#columnIndex),
      originalColumn,
      ...dataSource.columns.slice(this.#columnIndex),
    ];
    for (const [index, row] of dataSource.rows.entries())
      row.data[originalColumn.name] = takeOne(this.#originalRowValues, index);
    alignRowDataToColumns(dataSource);
  }
}
