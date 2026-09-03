import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { getValueSize } from "@/services/resource/sheet/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class CreateRowCommand extends ADataSourceCommand<CommandType.CreateRow> {
  readonly type = CommandType.CreateRow;

  get description() {
    return `Create Row ${this.#index + 1}`;
  }

  readonly #index: number;
  readonly #newRow: Row;

  constructor(index: number, newRow: Row) {
    super();
    this.#index = index;
    this.#newRow = newRow;
  }

  execute(dataSource: DataSource) {
    for (const column of dataSource.columns) column.size += getValueSize(takeOne(this.#newRow.data, column.name));
    dataSource.rows = [...dataSource.rows.slice(0, this.#index), this.#newRow, ...dataSource.rows.slice(this.#index)];
  }

  undo(dataSource: DataSource) {
    const row = takeOne(dataSource.rows, this.#index);
    for (const column of dataSource.columns) column.size -= getValueSize(takeOne(row.data, column.name));
    dataSource.rows = dataSource.rows.filter((_row, index) => index !== this.#index);
  }
}
