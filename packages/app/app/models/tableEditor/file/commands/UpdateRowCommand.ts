import type { ColumnValue } from "#shared/models/tableEditor/file/column/ColumnValue";
import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { getRecordDifferenceDescription } from "@/services/tableEditor/file/commands/getRecordDifferenceDescription";
import { getValueSize } from "@/services/tableEditor/file/commands/getValueSize";
import { takeOne } from "@esposter/shared";

type RowSnapshot = { data: Record<string, ColumnValue>; description: string };

export class UpdateRowCommand extends ADataSourceCommand<CommandType.UpdateRow> {
  readonly type = CommandType.UpdateRow;

  get description() {
    const recordDifferenceDescription = getRecordDifferenceDescription(this.originalRow.data, this.updatedRow.data);
    const detail = recordDifferenceDescription ? `\n\n${recordDifferenceDescription}` : "";
    return `Edit Row ${this.index + 1}${detail}`;
  }

  private readonly index: number;
  private readonly originalRow: RowSnapshot;
  private readonly updatedRow: RowSnapshot;

  constructor(index: number, originalRow: RowSnapshot, updatedRow: RowSnapshot) {
    super();
    this.index = index;
    this.originalRow = originalRow;
    this.updatedRow = updatedRow;
  }

  protected doExecute(item: DataSourceItem) {
    if (!item.dataSource || this.index === -1) return;
    const row = takeOne(item.dataSource.rows, this.index);
    for (const column of item.dataSource.columns)
      column.size +=
        getValueSize(takeOne(this.updatedRow.data, column.name)) - getValueSize(takeOne(row.data, column.name));
    row.data = { ...this.updatedRow.data };
    row.description = this.updatedRow.description;
  }

  protected doUndo(item: DataSourceItem) {
    if (!item.dataSource || this.index === -1) return;
    const row = takeOne(item.dataSource.rows, this.index);
    for (const column of item.dataSource.columns)
      column.size +=
        getValueSize(takeOne(this.originalRow.data, column.name)) - getValueSize(takeOne(row.data, column.name));
    row.data = { ...this.originalRow.data };
    row.description = this.originalRow.description;
  }
}
