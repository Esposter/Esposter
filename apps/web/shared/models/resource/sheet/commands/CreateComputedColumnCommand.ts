import type { ComputedColumn } from "#shared/models/resource/sheet/column/ComputedColumn";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { ADataSourceCommand } from "#shared/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "#shared/models/resource/sheet/commands/CommandType";
import { getCreateColumnDescription } from "#shared/services/resource/sheet/commands/getCreateColumnDescription";

export class CreateComputedColumnCommand extends ADataSourceCommand<CommandType.CreateComputedColumn> {
  readonly type = CommandType.CreateComputedColumn;

  get description() {
    return getCreateColumnDescription(this.#newColumn.name);
  }

  readonly #columnIndex: number;
  readonly #newColumn: ComputedColumn;

  constructor(columnIndex: number, newColumn: ComputedColumn) {
    super();
    this.#columnIndex = columnIndex;
    this.#newColumn = newColumn;
  }

  execute(dataSource: DataSource) {
    dataSource.columns = [
      ...dataSource.columns.slice(0, this.#columnIndex),
      this.#newColumn,
      ...dataSource.columns.slice(this.#columnIndex),
    ];
    // No row.data writes — computed values are never stored
  }

  undo(dataSource: DataSource) {
    dataSource.columns = dataSource.columns.filter((column) => column.id !== this.#newColumn.id);
  }
}
