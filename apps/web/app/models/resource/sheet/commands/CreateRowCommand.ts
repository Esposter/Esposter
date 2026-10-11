import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { insertRowAt } from "@/services/resource/sheet/commands/insertRowAt";
import { removeRowAt } from "@/services/resource/sheet/commands/removeRowAt";

export class CreateRowCommand extends ADataSourceCommand<CommandType.CreateRow> {
  readonly type = CommandType.CreateRow;

  get description() {
    return `Create Row ${this.#index + 1}`;
  }

  readonly #index: number;
  readonly #newRow: Row;

  constructor(index: number, newRow: Row) {
    super();
    this.#index = index;
    this.#newRow = newRow;
  }

  execute(dataSource: DataSource) {
    insertRowAt(dataSource, this.#index, this.#newRow);
  }

  undo(dataSource: DataSource) {
    removeRowAt(dataSource, this.#index);
  }
}
