import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { pluralize } from "#shared/util/text/pluralize";
import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { getValueSize } from "@/services/resource/sheet/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class CreateRowsCommand extends ADataSourceCommand<CommandType.CreateRows> {
  readonly type = CommandType.CreateRows;

  get description() {
    return `Create ${this.#rows.length} ${pluralize("Row", this.#rows.length)}`;
  }

  readonly #rows: Row[];
  readonly #startIndex: number;

  constructor(startIndex: number, rows: Row[]) {
    super();
    this.#startIndex = startIndex;
    this.#rows = rows;
  }

  execute(dataSource: DataSource) {
    for (const row of this.#rows)
      for (const column of dataSource.columns) column.size += getValueSize(takeOne(row.data, column.name));
    dataSource.rows = [
      ...dataSource.rows.slice(0, this.#startIndex),
      ...this.#rows,
      ...dataSource.rows.slice(this.#startIndex),
    ];
  }

  undo(dataSource: DataSource) {
    for (const row of this.#rows)
      for (const column of dataSource.columns) column.size -= getValueSize(takeOne(row.data, column.name));
    dataSource.rows = [
      ...dataSource.rows.slice(0, this.#startIndex),
      ...dataSource.rows.slice(this.#startIndex + this.#rows.length),
    ];
  }
}
