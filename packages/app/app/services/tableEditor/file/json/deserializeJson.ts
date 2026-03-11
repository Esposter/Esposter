import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { JsonDataSourceItem } from "#shared/models/tableEditor/file/json/JsonDataSourceItem";

import { Column } from "#shared/models/tableEditor/file/Column";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import { coerceValue } from "@/services/tableEditor/file/coerceValue";
import { inferColumnType } from "@/services/tableEditor/file/inferColumnType";
import { inferDateFormat } from "@/services/tableEditor/file/inferDateFormat";
import { takeOne } from "@esposter/shared";

export const deserializeJson = async (file: File, _item: JsonDataSourceItem): Promise<DataSource> => {
  const text = await file.text();
  const rows = JSON.parse(text) as Record<string, unknown>[];
  if (rows.length === 0)
    return {
      columns: [],
      metadata: {
        dataSourceType: DataSourceType.Json,
        importedAt: new Date(),
        name: file.name,
        size: file.size,
      },
      rows: [],
      stats: { columnCount: 0, rowCount: 0, size: 0 },
    };

  const sourceNames = Object.keys(takeOne(rows));
  const columns = sourceNames.map((sourceName) => {
    const values = rows.map((row) => String(takeOne(row, sourceName)));
    const type = inferColumnType(values);
    if (type === ColumnType.Date)
      return new DateColumn({ format: inferDateFormat(values), name: sourceName, sourceName });
    return new Column({ name: sourceName, sourceName, type });
  });
  const parsedRows = rows.map((row) =>
    Object.fromEntries(
      columns.map((column) => [column.name, coerceValue(String(takeOne(row, column.name)), column.type)]),
    ),
  );
  for (const column of columns)
    column.size = parsedRows.reduce((total, row) => total + JSON.stringify(takeOne(row, column.name)).length, 0);
  return {
    columns,
    metadata: {
      dataSourceType: DataSourceType.Json,
      importedAt: new Date(),
      name: file.name,
      size: file.size,
    },
    rows: parsedRows,
    stats: {
      columnCount: columns.length,
      rowCount: parsedRows.length,
      size: columns.reduce((total, column) => total + column.size, 0),
    },
  };
};
