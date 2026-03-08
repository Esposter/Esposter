import type { CsvDataSourceItem } from "#shared/models/tableEditor/file/csv/CsvDataSourceItem";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { Column } from "#shared/models/tableEditor/file/Column";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { coerceValue } from "@/services/tableEditor/file/csv/coerceValue";
import { parseCsvLine } from "@/services/tableEditor/file/csv/parseCsvLine";
import { inferColumnType } from "@/services/tableEditor/file/inferColumnType";
import { takeOne } from "@esposter/shared";

export const parseCsv = async (file: File, item: CsvDataSourceItem): Promise<DataSource> => {
  const text = await file.text();
  const lines = text.split(/\r?\n/).filter((line) => line.trim() !== "");
  if (lines.length === 0)
    return {
      columns: [],
      metadata: {
        columnCount: 0,
        dataSourceType: DataSourceType.Csv,
        importedAt: new Date(),
        name: file.name,
        rowCount: 0,
        size: file.size,
      },
      rows: [],
    };

  const sourceNames = parseCsvLine(takeOne(lines), item.configuration.delimiter);
  const rawRows = lines.slice(1).map((line) => parseCsvLine(line, item.configuration.delimiter));
  const columns = sourceNames.map(
    (sourceName, index) =>
      new Column({
        name: sourceName,
        sourceName,
        type: inferColumnType(rawRows.map((row) => takeOne(row, index))),
      }),
  );
  const rows = rawRows.map((rawRow) =>
    Object.fromEntries(columns.map((column, index) => [column.name, coerceValue(takeOne(rawRow, index), column.type)])),
  );
  return {
    columns,
    metadata: {
      columnCount: columns.length,
      dataSourceType: DataSourceType.Csv,
      importedAt: new Date(),
      name: file.name,
      rowCount: rows.length,
      size: file.size,
    },
    rows,
  };
};
