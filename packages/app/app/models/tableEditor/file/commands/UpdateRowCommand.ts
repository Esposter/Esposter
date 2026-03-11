import type { ADataSourceItem } from "#shared/models/tableEditor/file/ADataSourceItem";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { getRecordDifferenceDescription } from "@/services/tableEditor/file/getRecordDifferenceDescription";
import { getValueSize } from "@/services/tableEditor/file/getValueSize";
import { takeOne } from "@esposter/shared";

export class UpdateRowCommand extends ADataSourceCommand {
  readonly name = "UpdateRowCommand";

  get description() {
    const recordDifferenceDescription = getRecordDifferenceDescription(this.originalRow, this.updatedRow);
    const detail = recordDifferenceDescription.length > 0 ? ` (${recordDifferenceDescription.join(", ")})` : "";
    return `Edit Row #${this.index + 1}${detail}`;
  }

  private readonly index: number;
  private readonly originalRow: DataSource["rows"][number];
  private readonly updatedRow: DataSource["rows"][number];

  constructor(index: number, originalRow: DataSource["rows"][number], updatedRow: DataSource["rows"][number]) {
    super();
    this.index = index;
    this.originalRow = originalRow;
    this.updatedRow = updatedRow;
  }

  protected doExecute(item: ADataSourceItem<DataSourceType>) {
    if (!item.dataSource || this.index === -1) return;
    const row = takeOne(item.dataSource.rows, this.index);
    for (const column of item.dataSource.columns)
      column.size += getValueSize(takeOne(this.updatedRow, column.name)) - getValueSize(takeOne(row, column.name));
    Object.assign(row, this.updatedRow);
  }

  protected doUndo(item: ADataSourceItem<DataSourceType>) {
    if (!item.dataSource || this.index === -1) return;
    const row = takeOne(item.dataSource.rows, this.index);
    for (const column of item.dataSource.columns)
      column.size += getValueSize(takeOne(this.originalRow, column.name)) - getValueSize(takeOne(row, column.name));
    Object.assign(row, this.originalRow);
  }
}
