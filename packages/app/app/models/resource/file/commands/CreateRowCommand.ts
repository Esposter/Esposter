import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";
import type { Row } from "#shared/models/resource/file/datasource/Row";

import { ADataSourceCommand } from "@/models/resource/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/file/commands/CommandType";
import { getValueSize } from "@/services/resource/file/commands/getValueSize";
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

  protected doExecute(dataSource: DataSource) {
    for (const column of dataSource.columns) column.size += getValueSize(takeOne(this.#newRow.data, column.name));
    dataSource.rows = [...dataSource.rows.slice(0, this.#index), this.#newRow, ...dataSource.rows.slice(this.#index)];
  }

  protected doUndo(dataSource: DataSource) {
    const row = takeOne(dataSource.rows, this.#index);
    for (const column of dataSource.columns) column.size -= getValueSize(takeOne(row.data, column.name));
    dataSource.rows = dataSource.rows.filter((_, i) => i !== this.#index);
  }
}
