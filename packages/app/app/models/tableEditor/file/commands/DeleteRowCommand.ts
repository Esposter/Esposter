import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { getValueSize } from "@/services/tableEditor/file/getValueSize";
import { takeOne } from "@esposter/shared";

export class DeleteRowCommand extends ADataSourceCommand {
  readonly name = "DeleteRowCommand";

  get description() {
    return `Delete row #${this.index + 1}`;
  }

  private readonly index: number;
  private readonly originalRow: DataSource["rows"][number];

  constructor(index: number, originalRow: DataSource["rows"][number]) {
    super();
    this.index = index;
    this.originalRow = originalRow;
  }

  execute(item: ADataSourceItem<DataSourceType>) {
    if (!item.dataSource) return;
    const row = takeOne(item.dataSource.rows, this.index);
    for (const column of item.dataSource.columns) column.size -= getValueSize(takeOne(row, column.name));
    item.dataSource.rows = item.dataSource.rows.filter((_, i) => i !== this.index);
  }

  undo(item: ADataSourceItem<DataSourceType>) {
    if (!item.dataSource) return;
    for (const column of item.dataSource.columns) column.size += getValueSize(takeOne(this.originalRow, column.name));
    item.dataSource.rows = [
      ...item.dataSource.rows.slice(0, this.index),
      this.originalRow,
      ...item.dataSource.rows.slice(this.index),
    ];
  }
}
