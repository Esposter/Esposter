import type { DataSource } from "#shared/models/tableEditor/file/datasource/DataSource";
import type { DataSourceType } from "#shared/models/tableEditor/file/datasource/DataSourceType";

import { Column } from "#shared/models/tableEditor/file/column/Column";
import { ColumnType } from "#shared/models/tableEditor/file/column/ColumnType";
import { DateColumn } from "#shared/models/tableEditor/file/column/DateColumn";
import { Row } from "#shared/models/tableEditor/file/datasource/Row";
import { coerceValue } from "@/services/tableEditor/file/column/coerceValue";
import { inferColumnType } from "@/services/tableEditor/file/column/inferColumnType";
import { inferDateFormat } from "@/services/tableEditor/file/column/inferDateFormat";
import { takeOne } from "@esposter/shared";

export const buildDataSource = (
  file: File,
  dataSourceType: DataSourceType,
  sourceNames: string[],
  bodyRows: string[][],
): DataSource => {
  const columns = sourceNames.map((sourceName, index) => {
    const values = bodyRows.map((row) => takeOne(row, index));
    const type = inferColumnType(values);
    if (type === ColumnType.Date)
      return new DateColumn({ format: inferDateFormat(values), name: sourceName, sourceName });
    return new Column({ name: sourceName, sourceName, type }) as DataSource["columns"][number];
  });
  const rows = bodyRows.map((bodyRow) => {
    const row = new Row();
    row.data = Object.fromEntries(
      columns.map((column, index) => [column.name, coerceValue(takeOne(bodyRow, index), column.type)]),
    );
    return row;
  });
  for (const column of columns)
    column.size = rows.reduce((total, row) => total + JSON.stringify(takeOne(row.data, column.name)).length, 0);
  return {
    columns,
    metadata: { dataSourceType, importedAt: new Date(), name: file.name, size: file.size },
    rows,
    stats: {
      columnCount: columns.length,
      rowCount: rows.length,
      size: columns.reduce((total, column) => total + column.size, 0),
    },
  };
};
