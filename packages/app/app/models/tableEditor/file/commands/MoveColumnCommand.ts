import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";

export class MoveColumnCommand extends ADataSourceCommand {
  readonly name = "MoveColumnCommand";
  private readonly columnName: string;
  private readonly fromIndex: number;
  private readonly toIndex: number;

  constructor(fromIndex: number, toIndex: number, columnName: string) {
    super();
    this.columnName = columnName;
    this.fromIndex = fromIndex;
    this.toIndex = toIndex;
  }

  get description() {
    return `Move "${this.columnName}" Column`;
  }

  protected doExecute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const columns = [...item.dataSource.columns];
    const [moved] = columns.splice(this.fromIndex, 1);
    if (!moved) return;
    columns.splice(this.toIndex, 0, moved);
    item.dataSource.columns = columns;
    item.dataSource.rows = item.dataSource.rows.map((row) =>
      Object.fromEntries(columns.map(({ name }) => [name, row[name] ?? null])),
    );
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource) return;
    const columns = [...item.dataSource.columns];
    const [moved] = columns.splice(this.toIndex, 1);
    if (!moved) return;
    columns.splice(this.fromIndex, 0, moved);
    item.dataSource.columns = columns;
    item.dataSource.rows = item.dataSource.rows.map((row) =>
      Object.fromEntries(columns.map(({ name }) => [name, row[name] ?? null])),
    );
  }
}
