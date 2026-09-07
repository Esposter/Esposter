import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { getValueSize } from "@/services/resource/sheet/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class DeleteRowCommand extends ADataSourceCommand<CommandType.DeleteRow> {
  readonly type = CommandType.DeleteRow;

  get description() {
    return `Delete Row ${this.#index + 1}`;
  }

  readonly #index: number;
  readonly #originalRow: Row;

  constructor(index: number, originalRow: Row) {
    super();
    this.#index = index;
    this.#originalRow = originalRow;
  }

  execute(dataSource: DataSource) {
    const row = takeOne(dataSource.rows, this.#index);
    for (const column of dataSource.columns) column.size -= getValueSize(takeOne(row.data, column.name));
    dataSource.rows = dataSource.rows.filter((_row, index) => index !== this.#index);
  }

  undo(dataSource: DataSource) {
    for (const column of dataSource.columns) column.size += getValueSize(takeOne(this.#originalRow.data, column.name));
    dataSource.rows = [
      ...dataSource.rows.slice(0, this.#index),
      this.#originalRow,
      ...dataSource.rows.slice(this.#index),
    ];
  }
}
