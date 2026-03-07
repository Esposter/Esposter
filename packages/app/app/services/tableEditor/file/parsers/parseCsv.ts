import type { CsvDataSourceItem } from "#shared/models/tableEditor/file/CsvDataSourceItem";
import type { DataSource } from "#shared/models/tableEditor/file/DataSource";

import { CsvColumn } from "#shared/models/tableEditor/file/CsvColumn";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { inferColumnType } from "@/services/tableEditor/file/inferColumnType";
import { coerceValue } from "@/services/tableEditor/file/parsers/coerceValue";
import { parseCsvLine } from "@/services/tableEditor/file/parsers/parseCsvLine";
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

  const sourceNames = parseCsvLine(takeOne(lines), item.delimiter);
  const rawRows = lines.slice(1).map((line) => parseCsvLine(line, item.delimiter));
  const columns = sourceNames.map(
    (sourceName, index) =>
      new CsvColumn({
        name: sourceName,
        sourceName,
        type: inferColumnType(rawRows.map((row) => row[index] ?? "")),
      }),
  );
  const rows = rawRows.map((rawRow) =>
    Object.fromEntries(columns.map((column, index) => [column.name, coerceValue(rawRow[index] ?? "", column.type)])),
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
