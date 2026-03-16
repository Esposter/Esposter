import type { ColumnValue } from "#shared/models/tableEditor/file/ColumnValue";
import type { DataSourceItemTypeMap } from "#shared/models/tableEditor/file/DataSourceItemTypeMap";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { getRecordDifferenceDescription } from "@/services/tableEditor/file/getRecordDifferenceDescription";
import { getValueSize } from "@/services/tableEditor/file/getValueSize";
import { takeOne } from "@esposter/shared";

export class UpdateRowCommand extends ADataSourceCommand<CommandType.UpdateRow> {
  readonly type = CommandType.UpdateRow;

  get description() {
    const recordDifferenceDescription = getRecordDifferenceDescription(this.originalRow.data, this.updatedRow.data);
    const detail = recordDifferenceDescription ? `\n\n${recordDifferenceDescription}` : "";
    return `Edit Row ${this.index + 1}${detail}`;
  }

  private readonly index: number;
  private readonly originalRow: { data: Record<string, ColumnValue> };
  private readonly updatedRow: { data: Record<string, ColumnValue> };

  constructor(
    index: number,
    originalRow: { data: Record<string, ColumnValue> },
    updatedRow: { data: Record<string, ColumnValue> },
  ) {
    super();
    this.index = index;
    this.originalRow = originalRow;
    this.updatedRow = updatedRow;
  }

  protected doExecute(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource || this.index === -1) return;
    const row = takeOne(item.dataSource.rows, this.index);
    for (const column of item.dataSource.columns)
      column.size +=
        getValueSize(takeOne(this.updatedRow.data, column.name)) - getValueSize(takeOne(row.data, column.name));
    row.data = { ...this.updatedRow.data };
  }

  protected doUndo(item: DataSourceItemTypeMap[keyof DataSourceItemTypeMap]) {
    if (!item.dataSource || this.index === -1) return;
    const row = takeOne(item.dataSource.rows, this.index);
    for (const column of item.dataSource.columns)
      column.size +=
        getValueSize(takeOne(this.originalRow.data, column.name)) - getValueSize(takeOne(row.data, column.name));
    row.data = { ...this.originalRow.data };
  }
}
