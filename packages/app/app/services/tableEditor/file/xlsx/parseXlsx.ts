import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { XlsxDataSourceItem } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceItem";

import { Column } from "#shared/models/tableEditor/file/Column";
import { DataSourceType } from "#shared/models/tableEditor/file/DataSourceType";
import { coerceValue } from "@/services/tableEditor/file/csv/coerceValue";
import { inferColumnType } from "@/services/tableEditor/file/inferColumnType";
import { takeOne } from "@esposter/shared";
import readXlsxFile from "read-excel-file/browser";

export const parseXlsx = async (file: File, item: XlsxDataSourceItem): Promise<DataSource> => {
  const rawData = await readXlsxFile(file, { sheet: item.configuration.sheetIndex + 1 });
  if (rawData.length === 0)
    return {
      columns: [],
      metadata: {
        columnCount: 0,
        dataSourceType: DataSourceType.Xlsx,
        importedAt: new Date(),
        name: file.name,
        rowCount: 0,
        size: file.size,
      },
      rows: [],
    };

  const sourceNames = takeOne(rawData).map((cell) => cell?.toString());
  const bodyRows = rawData.slice(1).map((row) => row.map((cell) => cell?.toString()));
  const columns = sourceNames.map(
    (sourceName, index) =>
      new Column({
        name: sourceName,
        sourceName,
        type: inferColumnType(bodyRows.map((row) => takeOne(row, index) ?? "")),
      }),
  );
  const rows = bodyRows.map((rawRow) =>
    Object.fromEntries(
      columns.map((column, index) => [column.name, coerceValue(takeOne(rawRow, index) ?? "", column.type)]),
    ),
  );
  return {
    columns,
    metadata: {
      columnCount: columns.length,
      dataSourceType: DataSourceType.Xlsx,
      importedAt: new Date(),
      name: file.name,
      rowCount: rows.length,
      size: file.size,
    },
    rows,
  };
};
