import type { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { Column } from "#shared/models/tableEditor/file/Column";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import { coerceValue } from "@/services/tableEditor/file/coerceValue";
import { parseCsvLine } from "@/services/tableEditor/file/csv/parseCsvLine";
import { inferColumnType } from "@/services/tableEditor/file/inferColumnType";
import { inferDateFormat } from "@/services/tableEditor/file/inferDateFormat";
import { takeOne } from "@esposter/shared";

export const deserializeCsv = async (file: File, item: CsvDataSourceItem): Promise<DataSource> => {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0)
    return {
      columns: [],
      metadata: {
        dataSourceType: DataSourceType.Csv,
        importedAt: new Date(),
        name: file.name,
        size: file.size,
      },
      rows: [],
      stats: { columnCount: 0, rowCount: 0, size: 0 },
    };

  const sourceNames = parseCsvLine(takeOne(lines), item.configuration.delimiter).map(
    (sourceName, index) => sourceName.trim() || `Column ${index + 1}`,
  );
  const rawRows = lines.slice(1).map((line) => parseCsvLine(line, item.configuration.delimiter));
  const columns = sourceNames.map((sourceName, index) => {
    const values = rawRows.map((row) => takeOne(row, index));
    const type = inferColumnType(values);
    if (type === ColumnType.Date)
      return new DateColumn({ format: inferDateFormat(values), name: sourceName, sourceName });
    return new Column({ name: sourceName, sourceName, type });
  });
  const rows = rawRows.map((rawRow) =>
    Object.fromEntries(columns.map((column, index) => [column.name, coerceValue(takeOne(rawRow, index), column.type)])),
  );
  for (const column of columns)
    column.size = rows.reduce((total, row) => total + JSON.stringify(row[column.name] ?? null).length, 0);
  return {
    columns,
    metadata: {
      dataSourceType: DataSourceType.Csv,
      importedAt: new Date(),
      name: file.name,
      size: file.size,
    },
    rows,
    stats: {
      columnCount: columns.length,
      rowCount: rows.length,
      size: columns.reduce((total, column) => total + column.size, 0),
    },
  };
};
