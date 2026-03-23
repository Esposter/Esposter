import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { getToggleColumnPinDescription } from "@/services/tableEditor/file/commands/getToggleColumnPinDescription";

export class ToggleColumnPinCommand extends ADataSourceCommand<CommandType.ToggleColumnPin> {
  readonly type = CommandType.ToggleColumnPin;

  get description() {
    return getToggleColumnPinDescription(this.columnName, this.fixed);
  }

  private readonly columnId: string;
  private readonly columnName: string;
  private readonly fixed: boolean;

  constructor(columnId: string, columnName: string, fixed: boolean) {
    super();
    this.columnId = columnId;
    this.columnName = columnName;
    this.fixed = fixed;
  }

  protected doExecute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const column = item.dataSource.columns.find(({ id }) => id === this.columnId);
    if (!column) return;
    column.fixed = !this.fixed;
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const column = item.dataSource.columns.find(({ id }) => id === this.columnId);
    if (!column) return;
    column.fixed = this.fixed;
  }
}
