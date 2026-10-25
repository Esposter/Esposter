import type { DataSource } from "#shared/models/resource/sheet/datasource/DataSource";
import type { Row } from "#shared/models/resource/sheet/datasource/Row";

import { getValueSize } from "#shared/services/resource/sheet/commands/getValueSize";
import { takeOne } from "@esposter/shared";

// Puts a row in at an index, counting its values into every column's size as it lands
export const insertRowAt = (dataSource: DataSource, index: number, row: Row) => {
  for (const column of dataSource.columns) column.size += getValueSize(takeOne(row.data, column.name));
  dataSource.rows = [...dataSource.rows.slice(0, index), row, ...dataSource.rows.slice(index)];
};
