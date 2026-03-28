import type { DataSourceItem } from "#shared/models/tableEditor/file/datasource/DataSourceItem";
import type { AffectedCell } from "@/models/tableEditor/file/commands/AffectedCell";

import { StringTransformationType } from "#shared/models/tableEditor/file/column/transformation/StringTransformationType";
import { ADataSourceCommand } from "@/models/tableEditor/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/tableEditor/file/commands/CommandType";
import { applyStringTransformation } from "@/services/tableEditor/file/commands/applyStringTransformation";
import { getValueSize } from "@/services/tableEditor/file/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class StringTransformationCommand extends ADataSourceCommand<CommandType.StringTransformation> {
  readonly type = CommandType.StringTransformation;

  get description() {
    return `Format Strings (${this.transform})`;
  }

  private readonly affectedCells: AffectedCell[];
  private readonly transform: StringTransformationType;

  constructor(transform: StringTransformationType, affectedCells: AffectedCell[]) {
    super();
    this.transform = transform;
    this.affectedCells = affectedCells;
  }

  protected doExecute(item: DataSourceItem) {
    if (!item.dataSource) return;
    const columnsByNameMap = new Map(item.dataSource.columns.map((column) => [column.name, column]));
    for (const { columnName, originalValue, rowIndex } of this.affectedCells) {
      const row = takeOne(item.dataSource.rows, rowIndex);
      const column = columnsByNameMap.get(columnName);
      if (!column) continue;
      const newValue = applyStringTransformation(String(originalValue), this.transform);
      column.size += getValueSize(newValue) - getValueSize(takeOne(row.data, columnName));
      row.data[columnName] = newValue;
    }
  }

  protected doUndo(item: DataSourceItem) {
    if (!item.dataSource) return;
    const columnsByNameMap = new Map(item.dataSource.columns.map((column) => [column.name, column]));
    for (const { columnName, originalValue, rowIndex } of this.affectedCells) {
      const row = takeOne(item.dataSource.rows, rowIndex);
      const column = columnsByNameMap.get(columnName);
      if (!column) continue;
      column.size += getValueSize(originalValue) - getValueSize(takeOne(row.data, columnName));
      row.data[columnName] = originalValue;
    }
  }
}
