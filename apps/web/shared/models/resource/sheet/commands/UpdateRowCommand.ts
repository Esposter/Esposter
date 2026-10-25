import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { ToData } from "@esposter/shared";

import { ADataSourceCommand } from "#shared/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "#shared/models/resource/sheet/commands/CommandType";
import { getRecordDifferenceDescription } from "#shared/services/resource/sheet/commands/getRecordDifferenceDescription";
import { getValueSize } from "#shared/services/resource/sheet/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class UpdateRowCommand extends ADataSourceCommand<CommandType.UpdateRow> {
  readonly type = CommandType.UpdateRow;

  get description() {
    const recordDifferenceDescription = getRecordDifferenceDescription(this.#originalRow.data, this.#updatedRow.data);
    const detail = recordDifferenceDescription ? `\n\n${recordDifferenceDescription}` : "";
    return `Edit Row ${this.#index + 1}${detail}`;
  }

  readonly #index: number;
  readonly #originalRow: ToData<Row>;
  readonly #updatedRow: ToData<Row>;

  constructor(index: number, originalRow: ToData<Row>, updatedRow: ToData<Row>) {
    super();
    this.#index = index;
    this.#originalRow = originalRow;
    this.#updatedRow = updatedRow;
  }

  execute(dataSource: ToData<DataSource>) {
    this.#setRowTo(dataSource, this.#updatedRow);
  }

  undo(dataSource: ToData<DataSource>) {
    this.#setRowTo(dataSource, this.#originalRow);
  }

  // Writes the given row's values over the row at this command's index, adjusting each column's size by the difference
  #setRowTo(dataSource: ToData<DataSource>, targetRow: ToData<Row>) {
    if (this.#index === -1) return;
    const row = takeOne(dataSource.rows, this.#index);
    for (const column of dataSource.columns)
      column.size += getValueSize(takeOne(targetRow.data, column.name)) - getValueSize(takeOne(row.data, column.name));
    row.data = { ...targetRow.data };
  }
}
