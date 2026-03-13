import type { DataSource } from "#shared/models/tableEditor/file/DataSource";
import type { XlsxDataSourceItem } from "#shared/models/tableEditor/file/xlsx/XlsxDataSourceItem";

import { takeOne } from "@esposter/shared";
import writeXlsxFile from "write-excel-file/browser";

export const serializeXlsx = (dataSource: DataSource, _item: XlsxDataSourceItem, _mimeType: string): Promise<Blob> => {
  const headerRow = dataSource.columns.map((column) => column.name);
  const dataRows = dataSource.rows.map((row) => dataSource.columns.map((column) => takeOne(row.data, column.name)));
  return writeXlsxFile([headerRow, ...dataRows], {});
};
