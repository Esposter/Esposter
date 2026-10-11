import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { insertRowAt } from "@/services/resource/sheet/commands/insertRowAt";
import { removeRowAt } from "@/services/resource/sheet/commands/removeRowAt";

export class DeleteRowCommand extends ADataSourceCommand<CommandType.DeleteRow> {
  readonly type = CommandType.DeleteRow;

  get description() {
    return `Delete Row ${this.#index + 1}`;
  }

  readonly #index: number;
  readonly #originalRow: Row;

  constructor(index: number, originalRow: Row) {
    super();
    this.#index = index;
    this.#originalRow = originalRow;
  }

  execute(dataSource: DataSource) {
    removeRowAt(dataSource, this.#index);
  }

  undo(dataSource: DataSource) {
    insertRowAt(dataSource, this.#index, this.#originalRow);
  }
}
