import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";

import { getValueSize } from "#shared/services/resource/sheet/commands/getValueSize";
import { takeOne } from "@esposter/shared";

// Takes the row at an index out, releasing its values from every column's size as it goes
export const removeRowAt = (dataSource: DataSource, index: number) => {
  const row = takeOne(dataSource.rows, index);
  for (const column of dataSource.columns) column.size -= getValueSize(takeOne(row.data, column.name));
  dataSource.rows = dataSource.rows.filter((_row, rowIndex) => rowIndex !== index);
};
