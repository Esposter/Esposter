import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { ADataSourceCommand } from "@/models/resource/sheet/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/sheet/commands/CommandType";
import { getToggleColumnVisibilityDescription } from "@/services/resource/sheet/commands/getToggleColumnVisibilityDescription";

export class ToggleColumnVisibilityCommand extends ADataSourceCommand<CommandType.ToggleColumnVisibility> {
  readonly type = CommandType.ToggleColumnVisibility;

  get description() {
    return getToggleColumnVisibilityDescription(this.#columnName, this.#hidden);
  }

  readonly #columnId: string;
  readonly #columnName: string;
  readonly #hidden: boolean;

  constructor(columnId: string, columnName: string, hidden: boolean) {
    super();
    this.#columnId = columnId;
    this.#columnName = columnName;
    this.#hidden = hidden;
  }

  execute(dataSource: DataSource) {
    const column = dataSource.columns.find(({ id }) => id === this.#columnId);
    if (!column) return;
    column.hidden = !this.#hidden;
  }

  undo(dataSource: DataSource) {
    const column = dataSource.columns.find(({ id }) => id === this.#columnId);
    if (!column) return;
    column.hidden = this.#hidden;
  }
}
