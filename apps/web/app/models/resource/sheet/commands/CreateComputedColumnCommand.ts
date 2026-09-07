import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { ComputedColumn } from "#shared/models/resource/sheet/column/ComputedColumn";
import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";

export class CreateComputedColumnCommand extends ADataSourceCommand<CommandType.CreateComputedColumn> {
  readonly type = CommandType.CreateComputedColumn;

  get description() {
    return `Create "${this.#newColumn.name}" Column`;
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
