import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { alignRowDataToColumns } from "@/services/resource/sheet/commands/alignRowDataToColumns";

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

  execute(dataSource: DataSource) {
    this.#moveColumn(dataSource, this.#fromIndex, this.#toIndex);
  }

  undo(dataSource: DataSource) {
    this.#moveColumn(dataSource, this.#toIndex, this.#fromIndex);
  }

  #moveColumn(dataSource: DataSource, fromIndex: number, toIndex: number) {
    const movedColumn = dataSource.columns[fromIndex];
    if (!movedColumn) return;

    dataSource.columns = dataSource.columns.toSpliced(fromIndex, 1).toSpliced(toIndex, 0, movedColumn);
    alignRowDataToColumns(dataSource);
  }
}
