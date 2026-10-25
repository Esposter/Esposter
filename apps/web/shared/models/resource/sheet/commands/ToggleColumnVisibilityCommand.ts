import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { ToData } from "@esposter/shared";

import { ADataSourceCommand } from "#shared/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "#shared/models/resource/sheet/commands/CommandType";
import { getToggleColumnVisibilityDescription } from "#shared/services/resource/sheet/commands/getToggleColumnVisibilityDescription";

export class ToggleColumnVisibilityCommand extends ADataSourceCommand<CommandType.ToggleColumnVisibility> {
  readonly type = CommandType.ToggleColumnVisibility;

  get description() {
    return getToggleColumnVisibilityDescription(this.#columnName, this.#isHidden);
  }

  readonly #columnId: string;
  readonly #columnName: string;
  readonly #isHidden: boolean;

  constructor(columnId: string, columnName: string, isHidden: boolean) {
    super();
    this.#columnId = columnId;
    this.#columnName = columnName;
    this.#isHidden = isHidden;
  }

  execute(dataSource: ToData<DataSource>) {
    const column = dataSource.columns.find(({ id }) => id === this.#columnId);
    if (!column) return;
    column.isHidden = !this.#isHidden;
  }

  undo(dataSource: ToData<DataSource>) {
    const column = dataSource.columns.find(({ id }) => id === this.#columnId);
    if (!column) return;
    column.isHidden = this.#isHidden;
  }
}
