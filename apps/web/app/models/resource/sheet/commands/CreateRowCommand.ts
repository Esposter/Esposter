import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";
import type { ToData } from "@esposter/shared";

import { ADataSourceCommand } from "#shared/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "#shared/models/resource/sheet/commands/CommandType";
import { insertRowAt } from "#src/services/resource/sheet/commands/insertRowAt";
import { removeRowAt } from "#src/services/resource/sheet/commands/removeRowAt";

export class CreateRowCommand extends ADataSourceCommand<typeof CommandType.CreateRow> {
  readonly type = CommandType.CreateRow;

  get description() {
    return `Create Row ${this.#index + 1}`;
  }

  readonly #index: number;
  readonly #newRow: ToData<Row>;

  constructor(index: number, newRow: ToData<Row>) {
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
