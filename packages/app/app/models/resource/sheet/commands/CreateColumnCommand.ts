import type { Column } from "#shared/models/resource/sheet/column/Column";
import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { getValueSize } from "@/services/resource/sheet/commands/getValueSize";

export class CreateColumnCommand extends ADataSourceCommand<CommandType.CreateColumn> {
  readonly type = CommandType.CreateColumn;

  get description() {
    return `Create "${this.#newColumn.name}" Column`;
  }

  readonly #columnIndex: number;
  readonly #newColumn: Column;

  constructor(columnIndex: number, newColumn: Column) {
    super();
    this.#columnIndex = columnIndex;
    this.#newColumn = newColumn;
  }

  protected doExecute(dataSource: DataSource) {
    this.#newColumn.size = dataSource.rows.length * getValueSize(null);
    dataSource.columns = [
      ...dataSource.columns.slice(0, this.#columnIndex),
      this.#newColumn,
      ...dataSource.columns.slice(this.#columnIndex),
    ];
    for (const { data } of dataSource.rows) data[this.#newColumn.name] = null;
  }

  protected doUndo(dataSource: DataSource) {
    dataSource.columns = dataSource.columns.filter((column) => column.name !== this.#newColumn.name);
    for (const { data } of dataSource.rows) delete data[this.#newColumn.name];
  }
}
