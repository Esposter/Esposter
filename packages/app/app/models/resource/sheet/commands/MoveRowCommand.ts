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
    const rows = [...dataSource.rows];
    const [moved] = rows.splice(this.#fromIndex, 1);
    if (!moved) return;
    rows.splice(this.#toIndex, 0, moved);
    dataSource.rows = rows;
  }

  undo(dataSource: DataSource) {
    const rows = [...dataSource.rows];
    const [moved] = rows.splice(this.#toIndex, 1);
    if (!moved) return;
    rows.splice(this.#fromIndex, 0, moved);
    dataSource.rows = rows;
  }
}
