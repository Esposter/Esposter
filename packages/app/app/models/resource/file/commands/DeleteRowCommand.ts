import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";
import type { Row } from "#shared/models/resource/file/datasource/Row";

import { ADataSourceCommand } from "@/models/resource/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/file/commands/CommandType";
import { getValueSize } from "@/services/resource/file/commands/getValueSize";
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

  protected doExecute(dataSource: DataSource) {
    const row = takeOne(dataSource.rows, this.#index);
    for (const column of dataSource.columns) column.size -= getValueSize(takeOne(row.data, column.name));
    dataSource.rows = dataSource.rows.filter((_, i) => i !== this.#index);
  }

  protected doUndo(dataSource: DataSource) {
    for (const column of dataSource.columns) column.size += getValueSize(takeOne(this.#originalRow.data, column.name));
    dataSource.rows = [
      ...dataSource.rows.slice(0, this.#index),
      this.#originalRow,
      ...dataSource.rows.slice(this.#index),
    ];
  }
}
