import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";

export class MoveRowCommand extends ADataSourceCommand<CommandType.MoveRow> {
  readonly type = CommandType.MoveRow;

  get description() {
    return `Move Row ${this.#fromIndex + 1} to ${this.#toIndex + 1}`;
  }

  readonly #fromIndex: number;
  readonly #toIndex: number;

  constructor(fromIndex: number, toIndex: number) {
    super();
    this.#fromIndex = fromIndex;
    this.#toIndex = toIndex;
  }

  execute(dataSource: DataSource) {
    this.#moveRow(dataSource, this.#fromIndex, this.#toIndex);
  }

  undo(dataSource: DataSource) {
    this.#moveRow(dataSource, this.#toIndex, this.#fromIndex);
  }

  #moveRow(dataSource: DataSource, fromIndex: number, toIndex: number) {
    const moved = dataSource.rows[fromIndex];
    if (!moved) return;

    dataSource.rows = dataSource.rows.toSpliced(fromIndex, 1).toSpliced(toIndex, 0, moved);
  }
}
