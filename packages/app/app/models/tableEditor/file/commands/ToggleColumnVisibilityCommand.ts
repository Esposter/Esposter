import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { getToggleColumnVisibilityDescription } from "@/services/tableEditor/file/getToggleColumnVisibilityDescription";

export class ToggleColumnVisibilityCommand extends ADataSourceCommand<CommandType.ToggleColumnVisibility> {
  readonly type = CommandType.ToggleColumnVisibility;

  get description() {
    return getToggleColumnVisibilityDescription(this.columnName, this.hidden);
  }

  private readonly columnId: string;
  private readonly columnName: string;
  private readonly hidden: boolean;

  constructor(columnId: string, columnName: string, hidden: boolean) {
    super();
    this.columnId = columnId;
    this.columnName = columnName;
    this.hidden = hidden;
  }

  protected doExecute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const column = item.dataSource.columns.find(({ id }) => id === this.columnId);
    if (!column) return;
    column.hidden = !this.hidden;
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const column = item.dataSource.columns.find(({ id }) => id === this.columnId);
    if (!column) return;
    column.hidden = this.hidden;
  }
}
