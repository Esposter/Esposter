import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { XlsxDataSourceItem } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceItem";

import { Column } from "#shared/models/tableEditor/file/Column";
import { ColumnType } from "#shared/models/tableEditor/file/ColumnType";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { DateColumn } from "#shared/models/tableEditor/file/DateColumn";
import { coerceValue } from "@/services/tableEditor/file/csv/coerceValue";
import { inferColumnType } from "@/services/tableEditor/file/inferColumnType";
import { inferDateFormat } from "@/services/tableEditor/file/inferDateFormat";
import { takeOne } from "@esposter/shared";
import readXlsxFile from "read-excel-file/browser";

export const parseXlsx = async (file: File, item: XlsxDataSourceItem): Promise<DataSource> => {
  const rawData = await readXlsxFile(file, { sheet: item.configuration.sheetIndex + 1 });
  if (rawData.length === 0)
    return {
      columns: [],
      metadata: {
        dataSourceType: DataSourceType.Xlsx,
        importedAt: new Date(),
        name: file.name,
        size: file.size,
      },
      rows: [],
      stats: { columnCount: 0, rowCount: 0, size: 0 },
    };

  const sourceNames = takeOne(rawData).map((cell, index) => cell?.toString().trim() || `Column ${index + 1}`);
  const bodyRows = rawData.slice(1).map((row) => row.map((cell) => cell?.toString()));
  const columns = sourceNames.map((sourceName, index) => {
    const values = bodyRows.map((row) => takeOne(row, index) ?? "");
    const type = inferColumnType(values);
    if (type === ColumnType.Date) return new DateColumn({ name: sourceName, sourceName, format: inferDateFormat(values) });
    return new Column({ name: sourceName, sourceName, type });
  });
  const rows = bodyRows.map((rawRow) =>
    Object.fromEntries(
      columns.map((column, index) => [column.name, coerceValue(takeOne(rawRow, index) ?? "", column.type)]),
    ),
  );
  for (const column of columns)
    column.size = rows.reduce((total, row) => total + JSON.stringify(row[column.name] ?? null).length, 0);
  return {
    columns,
    metadata: {
      dataSourceType: DataSourceType.Xlsx,
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
