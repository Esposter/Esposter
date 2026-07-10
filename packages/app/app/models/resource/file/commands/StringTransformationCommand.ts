import type { StringTransformationType } from "#shared/models/resource/file/column/transformation/string/StringTransformationType";
import type { DataSource } from "#shared/models/resource/file/datasource/DataSource";
import type { AffectedCell } from "@/models/resource/file/commands/AffectedCell";

import { ADataSourceCommand } from "@/models/resource/file/commands/ADataSourceCommand";
import { CommandType } from "@/models/resource/file/commands/CommandType";
import { computeStringTransformation } from "@/services/resource/file/column/transformation/string/computeStringTransformation";
import { getValueSize } from "@/services/resource/file/commands/getValueSize";
import { takeOne } from "@esposter/shared";

export class StringTransformationCommand extends ADataSourceCommand<CommandType.StringTransformation> {
  readonly type = CommandType.StringTransformation;

  get description() {
    return `Format Strings (${this.#stringTransformationType})`;
  }

  readonly #affectedCells: AffectedCell[];
  readonly #stringTransformationType: StringTransformationType;

  constructor(stringTransformationType: StringTransformationType, affectedCells: AffectedCell[]) {
    super();
    this.#stringTransformationType = stringTransformationType;
    this.#affectedCells = affectedCells;
  }

  protected doExecute(dataSource: DataSource) {
    const columnsByNameMap = new Map(dataSource.columns.map((column) => [column.name, column]));
    for (const { columnName, originalValue, rowIndex } of this.#affectedCells) {
      const row = takeOne(dataSource.rows, rowIndex);
      const column = columnsByNameMap.get(columnName);
      if (!column) continue;
      const newValue = computeStringTransformation(String(originalValue), this.#stringTransformationType);
      column.size += getValueSize(newValue) - getValueSize(takeOne(row.data, columnName));
      row.data[columnName] = newValue;
    }
  }

  protected doUndo(dataSource: DataSource) {
    const columnsByNameMap = new Map(dataSource.columns.map((column) => [column.name, column]));
    for (const { columnName, originalValue, rowIndex } of this.#affectedCells) {
      const row = takeOne(dataSource.rows, rowIndex);
      const column = columnsByNameMap.get(columnName);
      if (!column) continue;
      column.size += getValueSize(originalValue) - getValueSize(takeOne(row.data, columnName));
      row.data[columnName] = originalValue;
    }
  }
}
