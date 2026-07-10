import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";

import { ComputedColumn } from "#shared/models/resource/file/column/ComputedColumn";
import { ADataSourceCommand } from "@/models/resource/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/file/commands/CommandType";

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

  protected doExecute(dataSource: DataSource) {
    dataSource.columns = [
      ...dataSource.columns.slice(0, this.#columnIndex),
      this.#newColumn,
      ...dataSource.columns.slice(this.#columnIndex),
    ];
    // No row.data writes — computed values are never stored
  }

  protected doUndo(dataSource: DataSource) {
    dataSource.columns = dataSource.columns.filter((column) => column.id !== this.#newColumn.id);
  }
}
