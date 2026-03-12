import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";

import { Column } from "#shared/models/tableEditor/file/Column";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import { coerceValue } from "@/services/tableEditor/file/coerceValue";
import { inferColumnType } from "@/services/tableEditor/file/inferColumnType";
import { inferDateFormat } from "@/services/tableEditor/file/inferDateFormat";
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
    return new Column({ name: sourceName, sourceName, type });
  });
  const rows = bodyRows.map((bodyRow) =>
    Object.fromEntries(
      columns.map((column, index) => [column.name, coerceValue(takeOne(bodyRow, index), column.type)]),
    ),
  );
  for (const column of columns)
    column.size = rows.reduce((total, row) => total + JSON.stringify(row[column.name] ?? null).length, 0);
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
