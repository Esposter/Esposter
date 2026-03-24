import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/datasource/DataSourceItemTypeMap";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";

export class MoveRowCommand extends ADataSourceCommand<CommandType.MoveRow> {
  readonly type = CommandType.MoveRow;

  get description() {
    return `Move Row ${this.fromIndex + 1} to ${this.toIndex + 1}`;
  }

  private readonly fromIndex: number;
  private readonly toIndex: number;

  constructor(fromIndex: number, toIndex: number) {
    super();
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
  }

  protected doExecute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const rows = [...item.dataSource.rows];
    const [moved] = rows.splice(this.fromIndex, 1);
    if (!moved) return;
    rows.splice(this.toIndex, 0, moved);
    item.dataSource.rows = rows;
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const rows = [...item.dataSource.rows];
    const [moved] = rows.splice(this.toIndex, 1);
    if (!moved) return;
    rows.splice(this.fromIndex, 0, moved);
    item.dataSource.rows = rows;
  }
}
