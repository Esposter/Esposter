import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { takeOne } from "@esposter/shared";

export class MoveColumnCommand extends ADataSourceCommand<CommandType.MoveColumn> {
  readonly type = CommandType.MoveColumn;

  get description() {
    return `Move "${this.#columnName}" (Column ${this.#fromIndex + 1}) to "${this.#toColumnName}" (Column ${this.#toIndex + 1})`;
  }

  readonly #columnName: string;
  readonly #fromIndex: number;
  readonly #toColumnName: string;
  readonly #toIndex: number;

  constructor(fromIndex: number, toIndex: number, columnName: string, toColumnName: string) {
    super();
    this.#columnName = columnName;
    this.#fromIndex = fromIndex;
    this.#toColumnName = toColumnName;
    this.#toIndex = toIndex;
  }

  protected doExecute(dataSource: DataSource) {
    this.#moveColumn(dataSource);
  }

  protected doUndo(dataSource: DataSource) {
    this.#moveColumn(dataSource);
  }

  #moveColumn(dataSource: DataSource) {
    const columns = [...dataSource.columns];
    const [moved] = columns.splice(this.#fromIndex, 1);
    if (!moved) return;

    columns.splice(this.#toIndex, 0, moved);
    dataSource.columns = columns;
    const columnNames = columns.map(({ name }) => name);
    for (const row of dataSource.rows) {
      const newData: typeof row.data = {};
      for (const name of columnNames) newData[name] = takeOne(row.data, name);
      row.data = newData;
    }
  }
}
