import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { Row } from "#shared/models/resource/sheet/datasource/Row";
import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { getRecordDifferenceDescription } from "@/services/resource/sheet/commands/getRecordDifferenceDescription";
import { getValueSize } from "@/services/resource/sheet/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class UpdateRowCommand extends ADataSourceCommand<CommandType.UpdateRow> {
  readonly type = CommandType.UpdateRow;

  get description() {
    const recordDifferenceDescription = getRecordDifferenceDescription(this.#originalRow.data, this.#updatedRow.data);
    const detail = recordDifferenceDescription ? `\n\n${recordDifferenceDescription}` : "";
    return `Edit Row ${this.#index + 1}${detail}`;
  }

  readonly #index: number;
  readonly #originalRow: Row;
  readonly #updatedRow: Row;

  constructor(index: number, originalRow: Row, updatedRow: Row) {
    super();
    this.#index = index;
    this.#originalRow = originalRow;
    this.#updatedRow = updatedRow;
  }

  protected doExecute(dataSource: DataSource) {
    if (this.#index === -1) return;
    const row = takeOne(dataSource.rows, this.#index);
    for (const column of dataSource.columns)
      column.size +=
        getValueSize(takeOne(this.#updatedRow.data, column.name)) - getValueSize(takeOne(row.data, column.name));
    row.data = { ...this.#updatedRow.data };
  }

  protected doUndo(dataSource: DataSource) {
    if (this.#index === -1) return;
    const row = takeOne(dataSource.rows, this.#index);
    for (const column of dataSource.columns)
      column.size +=
        getValueSize(takeOne(this.#originalRow.data, column.name)) - getValueSize(takeOne(row.data, column.name));
    row.data = { ...this.#originalRow.data };
  }
}
